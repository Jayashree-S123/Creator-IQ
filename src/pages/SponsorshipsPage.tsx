import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Mail,
  User,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { CreatorStore } from '@/services/creatorStore';
import type { SponsorshipDeal, DealStage, PlatformType } from '@/types/creator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

export default function SponsorshipsPage() {
  const { state } = useCreatorAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageTab, setStageTab] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<SponsorshipDeal | null>(null);

  // Form Fields
  const [brand, setBrand] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [stage, setStage] = useState<DealStage>('in_progress');
  const [platform, setPlatform] = useState<PlatformType>('youtube');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Delete Dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<SponsorshipDeal | null>(null);

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return state.deals.filter((d: SponsorshipDeal) => {
      if (searchTerm.trim() && !d.brand.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (stageTab !== 'all' && d.stage !== stageTab) {
        return false;
      }
      if (platformFilter !== 'all' && d.platform !== platformFilter) {
        return false;
      }
      return true;
    });
  }, [state.deals, searchTerm, stageTab, platformFilter]);

  // Aggregate stats
  const totalPipelineValue = state.deals.reduce((sum: number, d: SponsorshipDeal) => sum + d.dealValue, 0);
  const inProgressDeals = state.deals.filter((d: SponsorshipDeal) => d.stage === 'in_progress');
  const inProgressValue = inProgressDeals.reduce((sum: number, d: SponsorshipDeal) => sum + d.dealValue, 0);
  const completedOrPaid = state.deals.filter((d: SponsorshipDeal) => d.stage === 'completed' || d.stage === 'paid');

  const handleOpenAdd = () => {
    setEditingDeal(null);
    setBrand('');
    setDealValue('5000');
    setStage('in_progress');
    setPlatform('youtube');
    setContactPerson('');
    setContactEmail('');
    setDeliverables('1x Dedicated video integration');
    setDueDate('2026-10-15');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (deal: SponsorshipDeal) => {
    setEditingDeal(deal);
    setBrand(deal.brand);
    setDealValue(deal.dealValue.toString());
    setStage(deal.stage);
    setPlatform(deal.platform);
    setContactPerson(deal.contactPerson);
    setContactEmail(deal.contactEmail);
    setDeliverables(deal.deliverables);
    setDueDate(deal.dueDate);
    setNotes(deal.notes || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) {
      toast.error('Please enter the brand name');
      return;
    }
    const val = parseFloat(dealValue);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid deal value');
      return;
    }

    if (editingDeal) {
      CreatorStore.updateDeal(editingDeal.id, {
        brand: brand.trim(),
        dealValue: val,
        stage,
        platform,
        contactPerson: contactPerson.trim() || 'Lead Contact',
        contactEmail: contactEmail.trim() || 'sponsor@brand.com',
        deliverables: deliverables.trim(),
        dueDate: dueDate || '2026-10-15',
        notes: notes.trim()
      });
      toast.success(`Deal with ${brand} updated`);
    } else {
      CreatorStore.addDeal({
        brand: brand.trim(),
        dealValue: val,
        stage,
        platform,
        contactPerson: contactPerson.trim() || 'Lead Contact',
        contactEmail: contactEmail.trim() || 'sponsor@brand.com',
        deliverables: deliverables.trim(),
        dueDate: dueDate || '2026-10-15',
        notes: notes.trim()
      });
      toast.success(`New deal with ${brand} ($${val.toLocaleString()}) created`);
    }

    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (dealToDelete) {
      CreatorStore.deleteDeal(dealToDelete.id);
      toast.success(`Deal with ${dealToDelete.brand} removed from pipeline.`);
      setDealToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const getStageBadgeColor = (stg: DealStage) => {
    switch (stg) {
      case 'prospect':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'pitching':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'negotiation':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'in_progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Sponsorship Deals Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage incoming brand partnerships, contracts, deliverables, and payment collection.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Brand Deal</span>
        </Button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Active Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${inProgressValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{inProgressDeals.length} deals currently in production</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Pipeline (All Stages)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalPipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{state.deals.length} total brand opportunities</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Closed & Paid Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {completedOrPaid.length} Deals
            </div>
            <p className="text-xs text-muted-foreground mt-1">100% on-time delivery record</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Pipeline Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <Input
            placeholder="Search by brand name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="bg-card w-36 h-9 text-xs">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="twitter">Twitter / X</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stageTab} onValueChange={setStageTab}>
            <SelectTrigger className="bg-card w-36 h-9 text-xs">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="pitching">Pitching</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Deals List */}
      {filteredDeals.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Briefcase className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold text-foreground">No sponsorship deals found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            No deals currently match your search and filter criteria.
          </p>
          <Button onClick={handleOpenAdd} variant="outline" className="mt-4 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add New Deal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDeals.map((deal: SponsorshipDeal) => (
            <Card key={deal.id} className="bg-card border-border hover:border-primary/40 transition-colors flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground truncate">{deal.brand}</h3>
                    <Badge variant="outline" className={`text-[10px] uppercase font-semibold h-5 px-1.5 ${getStageBadgeColor(deal.stage)}`}>
                      {deal.stage.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="uppercase font-semibold text-primary">{deal.platform}</span>
                    <span>•</span>
                    <span>Due: {deal.dueDate}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold text-primary">
                    ${deal.dealValue.toLocaleString()}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 pb-3">
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-xs">
                  <div className="font-semibold text-foreground mb-0.5">Deliverables:</div>
                  <div className="text-muted-foreground">{deal.deliverables}</div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{deal.contactPerson} ({deal.contactEmail})</span>
                  </div>
                </div>

                {deal.notes && (
                  <p className="text-[11px] text-muted-foreground/80 italic border-l-2 border-border pl-2 line-clamp-2">
                    "{deal.notes}"
                  </p>
                )}
              </CardContent>

              <div className="p-3 border-t border-border bg-card/60 flex items-center justify-between">
                {/* Quick Stage Transition */}
                <div className="flex items-center gap-1.5">
                  <Label className="text-[11px] text-muted-foreground">Stage:</Label>
                  <Select
                    value={deal.stage}
                    onValueChange={(newStage: DealStage) => {
                      CreatorStore.updateDeal(deal.id, { stage: newStage });
                      toast.success(`Deal status updated to ${newStage.replace('_', ' ')}`);
                    }}
                  >
                    <SelectTrigger className="h-7 text-[11px] w-28 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="pitching">Pitching</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleOpenEdit(deal)}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setDealToDelete(deal);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Deal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle>{editingDeal ? 'Edit Sponsorship Deal' : 'Add New Sponsorship Deal'}</DialogTitle>
            <DialogDescription>
              Record deal terms, deliverables scope, and contact details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs">Brand Name *</Label>
                <Input
                  id="brand"
                  required
                  placeholder="e.g. NordVPN"
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
                  placeholder="e.g. 7500"
                  value={dealValue}
                  onChange={e => setDealValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stage" className="text-xs">Pipeline Stage</Label>
                <Select value={stage} onValueChange={(v: DealStage) => setStage(v)}>
                  <SelectTrigger id="stage" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="pitching">Pitching</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="platform" className="text-xs">Target Platform</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="deliverables" className="text-xs">Deliverables Scope</Label>
              <Input
                id="deliverables"
                placeholder="e.g. 1x 60s mid-roll integration + pinned comment"
                value={deliverables}
                onChange={e => setDeliverables(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson" className="text-xs">Contact Person</Label>
                <Input
                  id="contactPerson"
                  placeholder="e.g. Jessica Chen"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactEmail" className="text-xs">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="partnerships@brand.com"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs">Delivery Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">Notes & Key Talking Points</Label>
              <Textarea
                id="notes"
                placeholder="Promo links, discount code conditions, UTM requirements..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {editingDeal ? 'Update Deal' : 'Save Deal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this brand deal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the deal with {dealToDelete?.brand} (${dealToDelete?.dealValue.toLocaleString()})? This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDealToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}