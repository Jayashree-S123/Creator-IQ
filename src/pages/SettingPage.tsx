import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Bell,
  Globe,
  DollarSign,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { CreatorStore } from '@/services/creatorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

export default function SettingsPage() {
  const { user, updateProfile, state, logout } = useCreatorAuth();
  const navigate = useNavigate();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState(user?.category || 'Tech & Lifestyle');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Preferences fields
  const [theme, setTheme] = useState(state.settings.theme);
  const [currency, setCurrency] = useState(state.settings.currency);
  const [dateFormat, setDateFormat] = useState(state.settings.dateFormat);
  const [emailAlerts, setEmailAlerts] = useState(state.settings.emailAlerts);
  const [dealReminders, setDealReminders] = useState(state.settings.dealReminders);
  const [weeklyDigest, setWeeklyDigest] = useState(state.settings.weeklyDigest);

  // Dialogs
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateProfile({
      name: name.trim(),
      handle: handle.trim(),
      email: email.trim(),
      category: category.trim(),
      bio: bio.trim(),
      website: website.trim(),
      avatar: avatar.trim()
    });
    toast.success('Profile changes saved successfully');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    CreatorStore.updateSettings({
      theme,
      currency,
      dateFormat,
      emailAlerts,
      dealReminders,
      weeklyDigest
    });
    toast.success('System preferences updated');
  };

  const handleResetDemoData = () => {
    CreatorStore.resetToDemo();
    toast.success('Reset database to clean CreatorIQ demo state.');
    setResetConfirmOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your creator profile, theme preferences, and notification channels.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="profile" className="text-xs">Profile & Brand</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs">Theme & System</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Alert Channels</TabsTrigger>
          <TabsTrigger value="danger" className="text-xs text-destructive">Data & Session</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Brand */}
        <TabsContent value="profile" className="pt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Creator Profile</CardTitle>
              <CardDescription className="text-xs">This information is shown in media kits and exported PDF reports</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs">Full Name / Channel Title *</Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="handle" className="text-xs">Primary Social Handle</Label>
                    <Input
                      id="handle"
                      value={handle}
                      onChange={e => setHandle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Business Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs">Creator Category</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-xs">Website / Link in Bio</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="avatar" className="text-xs">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs">Creator Biography / Pitch</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
                </div>

                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Theme & Preferences */}
        <TabsContent value="preferences" className="pt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Display & System Preferences</CardTitle>
              <CardDescription className="text-xs">Customize your workspace visual mode and currency display</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePreferences} className="space-y-6">
                {/* Dark Mode Switch */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      <span>Dark Appearance Mode</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Enable comfortable high-contrast dark theme optimized for low-light editing sessions
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Reporting Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="USD ($)">USD ($)</SelectItem>
                        <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                        <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                        <SelectItem value="CAD ($)">CAD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Date Display Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="bg-background text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                  Save Preferences
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Notifications */}
        <TabsContent value="notifications" className="pt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notification Subscriptions</CardTitle>
              <CardDescription className="text-xs">Control delivery triggers for emails and internal alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                <div>
                  <div className="text-sm font-semibold text-foreground">Sponsorship Due Reminders</div>
                  <div className="text-xs text-muted-foreground">Receive reminders 7 days and 48 hours before deliverable deadlines</div>
                </div>
                <Switch checked={dealReminders} onCheckedChange={setDealReminders} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                <div>
                  <div className="text-sm font-semibold text-foreground">Email Security & Ingestion Alerts</div>
                  <div className="text-xs text-muted-foreground">Alert when social token expirations or sync failures occur</div>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                <div>
                  <div className="text-sm font-semibold text-foreground">Weekly Performance Digest</div>
                  <div className="text-xs text-muted-foreground">Summary email every Monday with week-over-week view metrics and revenue</div>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>

              <Button onClick={handleSavePreferences} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Danger Zone */}
        <TabsContent value="danger" className="pt-4 space-y-4">
          <Card className="bg-card border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-destructive">Data & Session Management</CardTitle>
              <CardDescription className="text-xs">Reset local store to pristine demo state or sign out of your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                <div>
                  <div className="text-sm font-semibold text-foreground">Reset Demo Data</div>
                  <div className="text-xs text-muted-foreground">Restores default CreatorIQ deals, content items, and revenue records</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-border"
                  onClick={() => setResetConfirmOpen(true)}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Reset to Demo
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <div className="text-sm font-semibold text-destructive">Sign Out of Session</div>
                  <div className="text-xs text-muted-foreground">Terminate session on this device and return to login screen</div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                  onClick={() => setLogoutConfirmOpen(true)}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation */}
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all default CreatorIQ analytics content, sponsorship deals, and revenue entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetDemoData} className="bg-primary text-primary-foreground">
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Confirmation */}
      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end your current CreatorIQ session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}