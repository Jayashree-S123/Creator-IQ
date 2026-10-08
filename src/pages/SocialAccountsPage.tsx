import React, { useState } from 'react';
import {
  Share2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { CreatorStore } from '@/services/creatorStore';
import type { PlatformType, ConnectedAccount } from '@/types/creator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function SocialAccountsPage() {
  const { state } = useCreatorAuth();
  const [syncingPlatform, setSyncingPlatform] = useState<PlatformType | null>(null);

  // Disconnect Confirmation Dialog
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [targetAccount, setTargetAccount] = useState<ConnectedAccount | null>(null);

  const handleSync = (platform: PlatformType) => {
    setSyncingPlatform(platform);
    setTimeout(() => {
      CreatorStore.syncAccount(platform);
      setSyncingPlatform(null);
      toast.success(`${platform.toUpperCase()} metrics refreshed and synced!`);
    }, 800);
  };

  const handleToggleConnect = (acc: ConnectedAccount) => {
    if (acc.connected) {
      // Disconnecting requires confirmation
      setTargetAccount(acc);
      setDisconnectModalOpen(true);
    } else {
      // Connecting
      CreatorStore.toggleAccount(acc.platform);
      toast.success(`Successfully connected ${acc.platform.toUpperCase()} account.`);
    }
  };

  const handleConfirmDisconnect = () => {
    if (targetAccount) {
      CreatorStore.toggleAccount(targetAccount.platform);
      toast.success(`Disconnected ${targetAccount.platform.toUpperCase()} channel.`);
      setTargetAccount(null);
      setDisconnectModalOpen(false);
    }
  };

  const getPlatformIcon = (plat: PlatformType) => {
    switch (plat) {
      case 'youtube':
        return <div className="w-10 h-10 rounded-xl bg-red-600/15 text-red-500 flex items-center justify-center font-bold text-sm">YT</div>;
      case 'instagram':
        return <div className="w-10 h-10 rounded-xl bg-pink-600/15 text-pink-500 flex items-center justify-center font-bold text-sm">IG</div>;
      case 'tiktok':
        return <div className="w-10 h-10 rounded-xl bg-cyan-600/15 text-cyan-500 flex items-center justify-center font-bold text-sm">TT</div>;
      case 'twitter':
        return <div className="w-10 h-10 rounded-xl bg-sky-600/15 text-sky-500 flex items-center justify-center font-bold text-sm">X</div>;
      case 'twitch':
        return <div className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-500 flex items-center justify-center font-bold text-sm">TW</div>;
      case 'linkedin':
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-500 flex items-center justify-center font-bold text-sm">
      in
    </div>
  );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Connected Social Accounts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage API connections, OAuth permissions, and live webhook synchronization for all channels.
        </p>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.accounts.map((acc: ConnectedAccount) => {
          const isSyncing = syncingPlatform === acc.platform;
          return (
            <Card key={acc.platform} className="bg-card border-border hover:border-primary/40 transition-colors flex flex-col">
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {getPlatformIcon(acc.platform)}
                    <div className="truncate text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground truncate">{acc.name}</h3>
                        <Badge
                          variant={acc.connected ? 'default' : 'secondary'}
                          className={`text-[10px] h-4 px-1.5 capitalize ${
                            acc.connected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''
                          }`}
                        >
                          {acc.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{acc.handle}</p>
                    </div>
                  </div>

                  <a
                    href={acc.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-foreground shrink-0"
                    title="View Channel"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="p-3 rounded-lg bg-background/50 border border-border/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground text-[11px]">Follower Base</div>
                    <div className="font-bold text-foreground mt-0.5">{acc.followers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[11px]">Last Sync</div>
                    <div className="font-medium text-foreground mt-0.5">{acc.lastSynced}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    disabled={!acc.connected || isSyncing}
                    onClick={() => handleSync(acc.platform)}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </Button>

                  <Button
                    variant={acc.connected ? 'ghost' : 'default'}
                    size="sm"
                    className={`text-xs h-8 ${
                      acc.connected
                        ? 'text-destructive hover:bg-destructive/10'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                    onClick={() => handleToggleConnect(acc)}
                  >
                    {acc.connected ? 'Disconnect' : 'Connect Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security note card */}
      <Card className="bg-card/60 border-border p-4 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
        <p className="text-xs text-muted-foreground">
          CreatorIQ accesses your social channels through read-only OAuth tokens. We will never post or publish without your explicit manual consent.
        </p>
      </Card>

      {/* Disconnect Alert */}
      <AlertDialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {targetAccount?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink your {targetAccount?.platform.toUpperCase()} account? Analytics data ingestion for this channel will be paused.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTargetAccount(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}