import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Filter,
  ArrowUpRight,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  PieChart as PieIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { CreatorStore } from '@/services/creatorStore';
import type { RevenueRecord, RevenueCategory, PlatformType } from '@/types/creator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function RevenuePage() {
  const { state } = useCreatorAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RevenueRecord | null>(null);

  const [source, setSource] = useState<RevenueCategory>('sponsorship');
  const [brandOrPayer, setBrandOrPayer] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('youtube');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'received' | 'pending' | 'invoiced'>('received');
  const [description, setDescription] = useState('');

  // Delete Alert
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<RevenueRecord | null>(null);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return state.revenue.filter((rec: RevenueRecord) => {
      if (categoryFilter !== 'all' && rec.source !== categoryFilter) return false;
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      return true;
    });
  }, [state.revenue, categoryFilter, statusFilter]);

  // Aggregate sums
  const totalReceived = state.revenue
    .filter((r: RevenueRecord) => r.status === 'received')
    .reduce((sum: number, r: RevenueRecord) => sum + r.amount, 0);

  const totalPending = state.revenue
    .filter((r: RevenueRecord) => r.status === 'pending' || r.status === 'invoiced')
    .reduce((sum: number, r: RevenueRecord) => sum + r.amount, 0);

  // Revenue by Category Donut
  const revenueByCategory = useMemo(() => {
    const map: Record<string, number> = {
      sponsorship: 0,
      adsense: 0,
      affiliate: 0,
      merch: 0
    };
    for (const r of state.revenue) {
      map[r.source] = (map[r.source] || 0) + r.amount;
    }
    return [
      { name: 'Sponsorships', value: map.sponsorship, color: 'hsl(var(--primary))' },
      { name: 'AdSense / Platform', value: map.adsense, color: 'hsl(var(--chart-3))' },
      { name: 'Affiliate Marketing', value: map.affiliate, color: 'hsl(var(--chart-4))' },
      { name: 'Merchandise & Direct', value: map.merch, color: 'hsl(var(--chart-5))' }
    ];
  }, [state.revenue]);

  // Monthly Revenue Trend
  const monthlyTrend = [
    { month: 'Apr', amount: 14200 },
    { month: 'May', amount: 16800 },
    { month: 'Jun', amount: 19500 },
    { month: 'Jul', amount: 18400 },
    { month: 'Aug', amount: 22100 },
    { month: 'Sep', amount: 25400 }
  ];

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setSource('sponsorship');
    setBrandOrPayer('');
    setPlatform('youtube');
    setAmount('3500');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('received');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: RevenueRecord) => {
    setEditingRecord(rec);
    setSource(rec.source);
    setBrandOrPayer(rec.brandOrPayer);
    setPlatform(rec.platform);
    setAmount(rec.amount.toString());
    setDate(rec.date);
    setStatus(rec.status);
    setDescription(rec.description);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandOrPayer.trim()) {
      toast.error('Please enter the payer or brand name');
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (editingRecord) {
      CreatorStore.updateRevenue(editingRecord.id, {
        source,
        brandOrPayer: brandOrPayer.trim(),
        platform,
        amount: val,
        date: date || new Date().toISOString().split('T')[0],
        status,
        description: description.trim()
      });
      toast.success('Revenue record updated successfully');
    } else {
      CreatorStore.addRevenue({
        source,
        brandOrPayer: brandOrPayer.trim(),
        platform,
        amount: val,
        date: date || new Date().toISOString().split('T')[0],
        status,
        description: description.trim()
      });
      toast.success('New revenue entry added');
    }

    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      CreatorStore.deleteRevenue(recordToDelete.id);
      toast.success(`Revenue record for ${recordToDelete.brandOrPayer} deleted.`);
      setRecordToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Revenue & Financial Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track multi-channel income streams, pending brand disbursements, and payout timelines.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Revenue Record</span>
        </Button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Received (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalReceived.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-500 font-medium mt-1">+24.5% vs last year</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              ${totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Due within 30-45 days</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Top Income Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Sponsorships</div>
            <p className="text-xs text-muted-foreground mt-1">62% of aggregate monetization</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Average CPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$24.80</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">Tech niche benchmark</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid: Monthly Trend & Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monthly Income Trajectory (USD)</CardTitle>
            <CardDescription className="text-xs">Aggregated monetization across AdSense, deals, merch and affiliates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full min-w-0 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source Breakdown Donut */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Distribution</CardTitle>
            <CardDescription className="text-xs">Share of revenue by business category</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="w-full min-w-0 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {revenueByCategory.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [`$${val.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 pt-2">
              {revenueByCategory.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Transactions Table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Income Records & Invoices</CardTitle>
            <CardDescription className="text-xs">Ledger of all received and expected creator disbursements</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-background w-36 h-8 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="sponsorship">Sponsorships</SelectItem>
                <SelectItem value="adsense">AdSense</SelectItem>
                <SelectItem value="affiliate">Affiliates</SelectItem>
                <SelectItem value="merch">Merchandise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background w-32 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="invoiced">Invoiced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No revenue records match the selected filters.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((rec: RevenueRecord) => (
                <div key={rec.id} className="p-3 rounded-lg border border-border/80 bg-background/50 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{rec.brandOrPayer}</span>
                      <Badge variant="outline" className="text-[10px] uppercase h-4 px-1 border-border">
                        {rec.source}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] capitalize h-4 px-1.5 ${
                          rec.status === 'received'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : rec.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}
                      >
                        {rec.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {rec.description || 'Monetization disbursement'} • Date: {rec.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">
                        ${rec.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase">{rec.platform}</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(rec)}
                        title="Edit record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setRecordToDelete(rec);
                          setDeleteConfirmOpen(true);
                        }}
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Revenue Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Revenue Record' : 'Add Revenue Entry'}</DialogTitle>
            <DialogDescription>
              Record payouts from sponsorships, platform advertising, or affiliate programs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="brandOrPayer" className="text-xs">Payer / Brand Name *</Label>
                <Input
                  id="brandOrPayer"
                  required
                  placeholder="e.g. Google AdSense"
                  value={brandOrPayer}
                  onChange={e => setBrandOrPayer(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-xs">Amount (USD) *</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  placeholder="e.g. 2400"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="source" className="text-xs">Revenue Category</Label>
                <Select value={source} onValueChange={(v: RevenueCategory) => setSource(v)}>
                  <SelectTrigger id="source" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="sponsorship">Brand Sponsorship</SelectItem>
                    <SelectItem value="adsense">AdSense / Platform</SelectItem>
                    <SelectItem value="affiliate">Affiliate Marketing</SelectItem>
                    <SelectItem value="merch">Merchandise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="platform" className="text-xs">Platform</Label>
                <Select value={platform} onValueChange={(v: PlatformType) => setPlatform(v)}>
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs">Disbursement Status</Label>
                <Select value={status} onValueChange={(v: 'received' | 'pending' | 'invoiced') => setStatus(v)}>
                  <SelectTrigger id="status" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="received">Received / Cleared</SelectItem>
                    <SelectItem value="pending">Pending Processing</SelectItem>
                    <SelectItem value="invoiced">Invoiced (Net-30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs">Description / Notes</Label>
              <Input
                id="description"
                placeholder="e.g. August mid-roll integration payment"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editingRecord ? 'Save Changes' : 'Save Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this revenue record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the record for {recordToDelete?.brandOrPayer} (${recordToDelete?.amount.toLocaleString()})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}