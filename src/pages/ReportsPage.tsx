import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Share2,
  Eye,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FileCode,
  Printer
} from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { exportToCSV, exportToJSON, generatePDFReport } from '@/services/exportHelpers';
import type { ContentItem, SponsorshipDeal, RevenueRecord } from '@/types/creator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { state, user } = useCreatorAuth();
  const [reportTitle, setReportTitle] = useState('Creator Performance & Sponsorship Portfolio');
  const [dateRange, setDateRange] = useState('Last 30 Days (Sept 2026)');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Included sections
  const [includeAudience, setIncludeAudience] = useState(true);
  const [includeContent, setIncludeContent] = useState(true);
  const [includeDeals, setIncludeDeals] = useState(true);
  const [includeRevenue, setIncludeRevenue] = useState(true);

  // Computed summary
  const totalViews = state.content.reduce((acc: number, c: ContentItem) => acc + c.views, 0);
  const totalRev = state.revenue.reduce((acc: number, r: RevenueRecord) => acc + r.amount, 0);
  const activeDeals = state.deals.filter((d: SponsorshipDeal) => d.stage === 'in_progress');
  const inProgressDealsSum = activeDeals.reduce((acc: number, d: SponsorshipDeal) => acc + d.dealValue, 0);

  const handleExportCSV = () => {
    const headers = ['Category', 'Item / Brand', 'Platform / Format', 'Metric Value', 'Date / Due', 'Status'];
    const rows: (string | number)[][] = [];

    if (includeContent) {
      for (const c of state.content) {
        rows.push(['Content', c.title, `${c.platform} (${c.format})`, `${c.views} views (${c.engagementRate}% ER)`, c.publishDate, c.status]);
      }
    }

    if (includeDeals) {
      for (const d of state.deals) {
        rows.push(['Sponsorship', d.brand, d.platform, `$${d.dealValue}`, d.dueDate, d.stage]);
      }
    }

    if (includeRevenue) {
      for (const r of state.revenue) {
        rows.push(['Revenue', r.brandOrPayer, r.source, `$${r.amount}`, r.date, r.status]);
      }
    }

    exportToCSV(`CreatorIQ_Report_${Date.now()}`, headers, rows);
    toast.success('CSV Report exported successfully');
  };

  const handleExportJSON = () => {
    const payload = {
      reportTitle,
      dateRange,
      generatedAt: new Date().toISOString(),
      creator: {
        name: user?.name,
        handle: user?.handle,
        email: user?.email
      },
      summary: {
        totalAudienceReach: totalViews,
        monthlyRevenueUSD: totalRev,
        activeDealsCount: activeDeals.length,
        activePipelineUSD: inProgressDealsSum
      },
      content: includeContent ? state.content : undefined,
      sponsorships: includeDeals ? state.deals : undefined,
      revenue: includeRevenue ? state.revenue : undefined
    };

    exportToJSON(`CreatorIQ_Report_${Date.now()}`, payload);
    toast.success('JSON Report downloaded');
  };

  const handleExportPDF = () => {
    const summary = {
      'Creator': user?.name || 'Creator',
      'Total Views / Reach': totalViews.toLocaleString(),
      'Tracked Revenue': `$${totalRev.toLocaleString()}`,
      'Active Deal Pipeline': `$${inProgressDealsSum.toLocaleString()} (${activeDeals.length} deals)`
    };

    const headers = ['Entity', 'Platform', 'Metric / Value', 'Timeline', 'Stage / Status'];
    const rows: (string | number)[][] = [];

    if (includeDeals) {
      for (const d of state.deals.slice(0, 6)) {
        rows.push([`Brand: ${d.brand}`, d.platform.toUpperCase(), `$${d.dealValue.toLocaleString()}`, d.dueDate, d.stage.toUpperCase()]);
      }
    }

    if (includeContent) {
      for (const c of state.content.slice(0, 6)) {
        rows.push([c.title.slice(0, 32), c.platform.toUpperCase(), `${c.views.toLocaleString()} views`, c.publishDate, `${c.engagementRate}% ER`]);
      }
    }

    generatePDFReport(reportTitle, summary, headers, rows);
    toast.success('Executive PDF print dialog opened');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Reports & Export Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate formal creator media kits, revenue statements, and campaign audit reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration Panel */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Report Settings</CardTitle>
            <CardDescription className="text-xs">Select data points and scope for export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Report Title</Label>
              <input
                type="text"
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-md px-3 py-2 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Time Horizon</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-background text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                  <SelectItem value="Last 30 Days (Sept 2026)">Last 30 Days (Sept 2026)</SelectItem>
                  <SelectItem value="Q3 2026 Comprehensive">Q3 2026 Comprehensive</SelectItem>
                  <SelectItem value="Full Year 2026 YTD">Full Year 2026 YTD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Platform Scope</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="bg-background text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Connected Channels</SelectItem>
                  <SelectItem value="youtube">YouTube Only</SelectItem>
                  <SelectItem value="instagram">Instagram Only</SelectItem>
                  <SelectItem value="tiktok">TikTok Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 space-y-2.5">
              <Label className="text-xs font-semibold text-foreground">Included Sections</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inc-content"
                  checked={includeContent}
                  onCheckedChange={v => setIncludeContent(Boolean(v))}
                />
                <label htmlFor="inc-content" className="text-xs text-muted-foreground cursor-pointer">
                  Top Content & Engagement Catalog
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inc-deals"
                  checked={includeDeals}
                  onCheckedChange={v => setIncludeDeals(Boolean(v))}
                />
                <label htmlFor="inc-deals" className="text-xs text-muted-foreground cursor-pointer">
                  Sponsorship Pipeline & Deliverables
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inc-revenue"
                  checked={includeRevenue}
                  onCheckedChange={v => setIncludeRevenue(Boolean(v))}
                />
                <label htmlFor="inc-revenue" className="text-xs text-muted-foreground cursor-pointer">
                  Monetization Ledger & Disbursements
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inc-audience"
                  checked={includeAudience}
                  onCheckedChange={v => setIncludeAudience(Boolean(v))}
                />
                <label htmlFor="inc-audience" className="text-xs text-muted-foreground cursor-pointer">
                  Audience Demographics & Geo Distribution
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <div className="text-xs font-semibold text-foreground mb-1">Export Actions:</div>
              <Button onClick={handleExportPDF} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9">
                <Printer className="w-4 h-4 mr-1.5" />
                Download PDF Executive Report
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleExportCSV} variant="outline" className="text-xs h-9">
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                  Export CSV
                </Button>
                <Button onClick={handleExportJSON} variant="outline" className="text-xs h-9">
                  <FileCode className="w-3.5 h-3.5 mr-1" />
                  Export JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Report Preview Canvas */}
        <Card className="lg:col-span-2 bg-card border-border flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Live Report Preview</CardTitle>
              <CardDescription className="text-xs">Real-time rendered preview of document</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              Verified Data
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="p-5 rounded-xl border border-border bg-background shadow-inner space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{reportTitle}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Creator: <span className="font-semibold text-foreground">{user?.name}</span> ({user?.handle}) • {dateRange}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-primary">CreatorIQ Media Kit</div>
                  <div className="text-[10px] text-muted-foreground">Generated Today</div>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Audience Reach</div>
                  <div className="text-lg font-bold text-foreground mt-0.5">{totalViews.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Gross Monetization</div>
                  <div className="text-lg font-bold text-primary mt-0.5">${totalRev.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Active Sponsorships</div>
                  <div className="text-lg font-bold text-foreground mt-0.5">${inProgressDealsSum.toLocaleString()}</div>
                </div>
              </div>

              {/* Included Sections Preview */}
              <div className="space-y-3 pt-2">
                {includeDeals && (
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Sponsorship Pipeline Highlights</span>
                    </h4>
                    <div className="space-y-1 text-xs">
                      {state.deals.slice(0, 3).map((d: SponsorshipDeal) => (
                        <div key={d.id} className="p-2 rounded bg-muted/30 border border-border flex items-center justify-between">
                          <span className="font-semibold text-foreground">{d.brand} ({d.platform})</span>
                          <span className="text-muted-foreground">{d.deliverables}</span>
                          <span className="font-bold text-primary">${d.dealValue.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {includeContent && (
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Top Performing Content Index</span>
                    </h4>
                    <div className="space-y-1 text-xs">
                      {state.content.slice(0, 3).map((c: ContentItem) => (
                        <div key={c.id} className="p-2 rounded bg-muted/30 border border-border flex items-center justify-between">
                          <span className="font-medium text-foreground truncate max-w-[240px]">{c.title}</span>
                          <span className="text-muted-foreground">{c.views.toLocaleString()} views</span>
                          <span className="font-semibold text-emerald-500">{c.engagementRate}% ER</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}