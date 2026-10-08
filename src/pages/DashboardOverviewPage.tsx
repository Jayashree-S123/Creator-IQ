import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Eye,
  TrendingUp,
  DollarSign,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Calendar,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { CreatorStore } from '@/services/creatorStore';
import type { PlatformType, SponsorshipDeal, ContentItem, RevenueRecord, ConnectedAccount } from '@/types/creator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function DashboardOverviewPage() {
  const { state, user } = useCreatorAuth();
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');

  // New Deal Modal State
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [brand, setBrand] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [dealPlatform, setDealPlatform] = useState<PlatformType>('youtube');
  const [deliverables, setDeliverables] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Multipliers based on date range and platform
  const rangeMultiplier = dateRange === '7d' ? 0.35 : dateRange === '90d' ? 2.6 : dateRange === '12m' ? 8.4 : 1;

  // Filter content
  const filteredContent = useMemo(() => {
    return state.content.filter((item: ContentItem) => {
      if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
      return true;
    });
  }, [state.content, platformFilter]);

  // Aggregate metrics
  const totalViews = useMemo(() => {
    const raw = filteredContent.reduce((acc: number, curr: ContentItem) => acc + curr.views, 0);
    return Math.round(raw * rangeMultiplier);
  }, [filteredContent, rangeMultiplier]);

  const activeDeals = state.deals.filter((d: SponsorshipDeal) => d.stage === 'in_progress' || d.stage === 'pitching' || d.stage === 'negotiation');
  const activeDealsSum = activeDeals.reduce((sum: number, d: SponsorshipDeal) => sum + d.dealValue, 0);

  // Revenue sum
  const totalMonthlyRev = useMemo(() => {
    const base = state.revenue.reduce((acc: number, curr: RevenueRecord) => acc + curr.amount, 0);
    return Math.round(base * (platformFilter === 'all' ? 1 : 0.65) * (rangeMultiplier > 1 ? 1.5 : 1));
  }, [state.revenue, platformFilter, rangeMultiplier]);

  // Dynamic Chart Data based on range & platform
  const performanceTrend = useMemo(() => {
    if (dateRange === '7d') {
      return [
        { label: 'Day 1', views: 24000, engagement: 2100 },
        { label: 'Day 2', views: 31000, engagement: 2900 },
        { label: 'Day 3', views: 28000, engagement: 2400 },
        { label: 'Day 4', views: 42000, engagement: 3800 },
        { label: 'Day 5', views: 56000, engagement: 5200 },
        { label: 'Day 6', views: 68000, engagement: 6100 },
        { label: 'Day 7', views: 74000, engagement: 6900 }
      ];
    }
    if (dateRange === '90d') {
      return [
        { label: 'Jul W1', views: 180000, engagement: 14200 },
        { label: 'Jul W3', views: 210000, engagement: 17800 },
        { label: 'Aug W1', views: 260000, engagement: 22100 },
        { label: 'Aug W3', views: 295000, engagement: 25400 },
        { label: 'Sep W1', views: 340000, engagement: 31000 },
        { label: 'Sep W3', views: 395000, engagement: 37400 }
      ];
    }
    // 30d default
    return [
      { label: 'Sep 01', views: 48000, engagement: 4200 },
      { label: 'Sep 05', views: 62000, engagement: 5800 },
      { label: 'Sep 10', views: 95000, engagement: 8900 },
      { label: 'Sep 15', views: 88000, engagement: 7900 },
      { label: 'Sep 20', views: 145000, engagement: 13500 },
      { label: 'Sep 24', views: 184500, engagement: 16800 }
    ];
  }, [dateRange]);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) {
      toast.error('Please enter brand name');
      return;
    }
    const val = parseFloat(dealValue);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid deal value');
      return;
    }

    CreatorStore.addDeal({
      brand: brand.trim(),
      dealValue: val,
      contactPerson: contactPerson.trim() || 'Partnerships Lead',
      contactEmail: contactEmail.trim() || 'sponsor@brand.com',
      stage: 'in_progress',
      platform: dealPlatform,
      deliverables: deliverables.trim() || '1x Dedicated video integration',
      dueDate: dueDate || '2026-10-15',
      notes: notes.trim()
    });

    toast.success(`Deal with ${brand} ($${val.toLocaleString()}) created!`);
    setNewDealOpen(false);
    // Reset form
    setBrand('');
    setDealValue('');
    setContactPerson('');
    setContactEmail('');
    setDeliverables('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.name?.split(' ')[0] || 'Creator'} 👋
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex bg-primary/10 text-primary border-primary/20">
              Live Ingestion
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time multi-platform audience growth, brand sponsorships, and monetization insights.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Platform Selector */}
          <div className="w-36">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="bg-card h-9 text-xs">
                <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter / X</SelectItem>
                <SelectItem value="twitch">Twitch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selector */}
          <div className="w-32">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-card h-9 text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Add Deal CTA */}
          <Dialog open={newDealOpen} onOpenChange={setNewDealOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                <Plus className="w-4 h-4 mr-1" />
                <span>New Deal</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card">
              <DialogHeader>
                <DialogTitle>Add New Sponsorship Deal</DialogTitle>
                <DialogDescription>
                  Track an incoming brand partnership, deliverables, and payout timeline.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDeal} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="brand" className="text-xs">Brand Name *</Label>
                    <Input
                      id="brand"
                      required
                      placeholder="e.g. Logitech"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dealValue" className="text-xs">Deal Value (USD) *</Label>
                    <Input
                      id="dealValue"
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={dealValue}
                      onChange={e => setDealValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="platform" className="text-xs">Primary Platform</Label>
                    <Select value={dealPlatform} onValueChange={(val: PlatformType) => setDealPlatform(val)}>
                      <SelectTrigger id="platform" className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="twitter">Twitter / X</SelectItem>
                        <SelectItem value="twitch">Twitch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dueDate" className="text-xs">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deliverables" className="text-xs">Deliverables Scope</Label>
                  <Input
                    id="deliverables"
                    placeholder="e.g. 1x 60s integration + pinned comment link"
                    value={deliverables}
                    onChange={e => setDeliverables(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPerson" className="text-xs">Brand Contact Person</Label>
                    <Input
                      id="contactPerson"
                      placeholder="e.g. Sarah Miller"
                      value={contactPerson}
                      onChange={e => setContactPerson(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactEmail" className="text-xs">Brand Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="sponsor@brand.com"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Key campaign messaging points, promo code rules, etc."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setNewDealOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Save Deal to Pipeline
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stat Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reach */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Audience Reach
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Eye className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {totalViews.toLocaleString()}
            </div>
            <div className="flex items-center text-xs mt-1 text-emerald-500 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>+18.4% vs previous {dateRange}</span>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Avg. Engagement Rate
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              8.6%
            </div>
            <div className="flex items-center text-xs mt-1 text-emerald-500 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>+2.1% benchmark index</span>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Revenue */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Monetization Revenue
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              ${totalMonthlyRev.toLocaleString()}
            </div>
            <div className="flex items-center text-xs mt-1 text-emerald-500 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              <span>+14.2% MoM growth</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Deals Pipeline */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Sponsorships
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Briefcase className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {activeDeals.length} Deals
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ${activeDealsSum.toLocaleString()} in current pipeline
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend Chart */}
        <Card className="lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Audience Attention & Velocity</CardTitle>
              <CardDescription className="text-xs">
                Aggregated views & engagement over {dateRange} ({platformFilter === 'all' ? 'All Channels' : platformFilter.toUpperCase()})
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="text-xs h-8">
              <Link to="/dashboard/growth">Full Breakdown</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="w-full min-w-0 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [val.toLocaleString(), 'Views']}
                  />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Connected Channels Summary */}
        <Card className="bg-card border-border shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Connected Platforms</CardTitle>
              <CardDescription className="text-xs">Live API synchronization status</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs h-7">
              <Link to="/dashboard/social">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {state.accounts.map((acc: ConnectedAccount) => (
              <div key={acc.platform} className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-background/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase text-primary">
                    {acc.platform.slice(0, 2)}
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs font-semibold text-foreground truncate">{acc.name}</p>
                    <p className="text-[11px] text-muted-foreground">{acc.followers.toLocaleString()} followers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${acc.connected ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {acc.connected ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Top Performing Content & Active Sponsorship Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent High-Performing Content */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Top Performing Content</CardTitle>
              <CardDescription className="text-xs">Highest engagement posts this period</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="text-xs h-8">
              <Link to="/dashboard/content">View All ({state.content.length})</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredContent.slice(0, 4).map((item: ContentItem) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-background/40 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-14 h-9 object-cover rounded-md border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-medium text-foreground truncate" title={item.title}>
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      <span className="uppercase font-semibold text-primary">{item.platform}</span>
                      <span>•</span>
                      <span>{item.views.toLocaleString()} views</span>
                      <span>•</span>
                      <span className="text-emerald-500 font-medium">{item.engagementRate}% ER</span>
                    </div>
                  </div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-foreground shrink-0 ml-2"
                  title="Open video"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Sponsorship Pipeline */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Active Deal Pipeline</CardTitle>
              <CardDescription className="text-xs">Upcoming brand integrations and contracts</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="text-xs h-8">
              <Link to="/dashboard/sponsorships">Manage Deals</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.deals.slice(0, 4).map((deal: SponsorshipDeal) => (
              <div key={deal.id} className="p-3 rounded-lg border border-border/80 bg-background/40 flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{deal.brand}</span>
                    <Badge variant="outline" className="text-[10px] uppercase h-5 px-1.5 py-0 border-border">
                      {deal.stage.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-1">
                    {deal.deliverables}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                    Due: {deal.dueDate} • Contact: {deal.contactPerson}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-primary">
                    ${deal.dealValue.toLocaleString()}
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground">
                    <Link to="/dashboard/sponsorships">Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Prepare Your Monthly Creator Media Kit</h3>
            <p className="text-xs text-muted-foreground">Download comprehensive verified statistics for brands and agencies in PDF or CSV.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link to="/dashboard/reports">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Generate Report
            </Link>
          </Button>
          <Button size="sm" asChild className="text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/dashboard/youtube">
              View YouTube Deep Dive
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}