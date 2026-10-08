import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Users,
  TrendingUp,
  Share2,
  Youtube,
 Instagram,
Linkedin,
Github,
  DollarSign,
  Briefcase,
  FileText,
  Bell,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  Search,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { CreatorStore } from '@/services/creatorStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const CreatorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, state } = useCreatorAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const unreadCount = state.notifications.filter((n: { read: boolean }) => !n.read).length;
  const isDark = state.settings.theme === 'dark';

  const navItems: NavItem[] = [
    { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Content', href: '/dashboard/content', icon: Video },
    { title: 'Audience', href: '/dashboard/audience', icon: Users },
    { title: 'Growth', href: '/dashboard/growth', icon: TrendingUp },
    { title: 'Social Accounts', href: '/dashboard/social', icon: Share2 },
    { title: 'YouTube Analytics', href: '/dashboard/youtube', icon: Youtube },
{ title: 'Instagram Analytics', href: '/dashboard/instagram', icon: Instagram },
{ title: 'LinkedIn Analytics', href: '/dashboard/linkedin', icon: Linkedin },
{title: 'GitHub Analytics',href: '/dashboard/github',icon: Github},
    { title: 'Revenue', href: '/dashboard/revenue', icon: DollarSign },
    { title: 'Sponsorships', href: '/dashboard/sponsorships', icon: Briefcase, badge: state.deals.filter((d: { stage: string }) => d.stage === 'in_progress').length },
    { title: 'Reports', href: '/dashboard/reports', icon: FileText },
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
    { title: 'Settings', href: '/dashboard/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
    navigate('/login');
  };

  const handleToggleTheme = () => {
    const next = CreatorStore.toggleTheme();
    toast.info(`Switched to ${next} mode`);
  };

  const filteredNavLinks = searchQuery.trim()
    ? navItems.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border bg-card/60 backdrop-blur-md">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80">
                Creator<span className="text-primary font-black">IQ</span>
              </span>
              <span className="ml-1.5 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Pro
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/15 text-primary font-semibold border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-border bg-card/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border">
            <Link to="/dashboard/settings" className="flex items-center gap-2.5 min-w-0 flex-1">
              <Avatar className="w-8 h-8 rounded-md border border-border">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || 'CR'}</AvatarFallback>
              </Avatar>
              <div className="truncate text-left">
                <p className="text-xs font-semibold truncate text-foreground">{user?.name || 'Creator'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.handle || '@creator'}</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setLogoutDialogOpen(true)}
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Global Topbar */}
        <header className="h-16 sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>CreatorIQ</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const active = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                          active
                            ? 'bg-primary/15 text-primary font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge !== undefined && (
                          <Badge variant={active ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setMobileOpen(false);
                      setLogoutDialogOpen(true);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Quick Search bar */}
            <div className="relative w-48 md:w-80">
              <Button
                variant="outline"
                className="w-full justify-between text-muted-foreground text-xs font-normal h-9 bg-card/60"
                onClick={() => setSearchModalOpen(true)}
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Search analytics, deals, content...</span>
                  <span className="sm:hidden">Search...</span>
                </div>
                <kbd className="hidden md:inline-flex text-[10px] border border-border px-1.5 py-0.5 rounded bg-muted">
                  ⌘K
                </kbd>
              </Button>
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center gap-2">
            {/* View Landing / Website */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden lg:flex text-xs text-muted-foreground hover:text-foreground"
            >
              <Link to="/">
                <span>Home</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </Button>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={handleToggleTheme}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Notifications Shortcut */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
            >
              <Link to="/dashboard/notifications">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </Link>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || 'CR'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/reports" className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Reports & Exports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/social" className="cursor-pointer">
                    <Share2 className="w-4 h-4 mr-2" />
                    Connected Accounts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              Your session will end and you will need to sign in again to access your creator dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground ml-2" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Jump to page or feature (e.g. YouTube, Revenue, Deals)..."
                className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground px-2 py-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setSearchModalOpen(false)}
              >
                ESC
              </Button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto">
              <div className="text-[11px] font-semibold text-muted-foreground px-3 py-1">Pages & Tools</div>
              {(filteredNavLinks.length > 0 ? filteredNavLinks : navItems).map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setSearchModalOpen(false);
                      setSearchQuery('');
                      navigate(item.href);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-muted/80 text-foreground transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-primary" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};