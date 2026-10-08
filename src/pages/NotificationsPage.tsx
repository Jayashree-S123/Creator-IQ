import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Award,
  DollarSign,
  Info,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { CreatorStore } from '@/services/creatorStore';
import type { CreatorNotification } from '@/types/creator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function NotificationsPage() {
  const { state } = useCreatorAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'deal' | 'milestone' | 'alert'>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notifToDelete, setNotifToDelete] = useState<CreatorNotification | null>(null);

  const filteredNotifs = useMemo(() => {
    return state.notifications.filter((n: CreatorNotification) => {
      if (filter === 'unread' && n.read) return false;
      if (filter === 'deal' && n.type !== 'deal') return false;
      if (filter === 'milestone' && n.type !== 'milestone') return false;
      if (filter === 'alert' && n.type !== 'alert') return false;
      return true;
    });
  }, [state.notifications, filter]);

  const unreadCount = state.notifications.filter((n: CreatorNotification) => !n.read).length;

  const handleMarkAllRead = () => {
    CreatorStore.markAllNotificationsRead();
    toast.success('All notifications marked as read.');
  };

  const handleMarkRead = (id: string) => {
    CreatorStore.markNotificationRead(id);
  };

  const handleConfirmDelete = () => {
    if (notifToDelete) {
      CreatorStore.deleteNotification(notifToDelete.id);
      toast.success('Notification removed.');
      setNotifToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const getIcon = (type: CreatorNotification['type']) => {
    switch (type) {
      case 'deal':
        return <DollarSign className="w-4 h-4 text-primary" />;
      case 'milestone':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Notifications & Activity Center
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time updates regarding brand contracts, deliverable deadlines, milestone achievements, and platform syncs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs h-9">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Mark All as Read
            </Button>
          )}

          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="bg-card w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="deal">Deals</SelectItem>
              <SelectItem value="milestone">Milestones</SelectItem>
              <SelectItem value="alert">Alerts & Reminders</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold text-foreground">No notifications found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You're completely caught up! New deal alerts and metric milestones will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((item: CreatorNotification) => (
            <Card
              key={item.id}
              className={`border-border transition-colors ${
                item.read ? 'bg-card/60 opacity-80' : 'bg-card border-primary/40 shadow-sm'
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="p-2.5 rounded-lg bg-muted border border-border shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span>{item.timestamp}</span>
                      {item.link && (
                        <Link to={item.link} className="text-primary hover:underline flex items-center gap-1 font-medium">
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!item.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleMarkRead(item.id)}
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setNotifToDelete(item);
                      setDeleteConfirmOpen(true);
                    }}
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notification?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dismiss "{notifToDelete?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNotifToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}