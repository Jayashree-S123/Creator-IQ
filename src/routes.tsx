import React, { type ReactNode } from 'react';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardOverviewPage from '@/pages/DashboardOverviewPage';
import ContentPage from '@/pages/ContentPage';
import AudiencePage from '@/pages/AudiencePage';
import GrowthPage from '@/pages/GrowthPage';
import LinkedInAnalyticsPage from '@/pages/LinkedInAnalyticsPage';
import GitHubAnalyticsPage from '@/pages/GitHubAnalyticsPage';
import SocialAccountsPage from '@/pages/SocialAccountsPage';
import YouTubeAnalyticsPage from '@/pages/YouTubeAnalyticsPage';
import InstagramPage from './pages/InstagramPage';
import RevenuePage from '@/pages/RevenuePage';
import SponsorshipsPage from '@/pages/SponsorshipsPage';
import ReportsPage from '@/pages/ReportsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreatorLayout } from '@/components/layout/CreatorLayout';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

const withLayout = (component: ReactNode) => (
  <ProtectedRoute>
    <CreatorLayout>{component}</CreatorLayout>
  </ProtectedRoute>
);

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
    public: true
  },
  {
    name: 'Sign In',
    path: '/login',
    element: <LoginPage />,
    public: true
  },
  {
    name: 'Register',
    path: '/register',
    element: <RegisterPage />,
    public: true
  },
  {
    name: 'Dashboard Overview',
    path: '/dashboard',
    element: withLayout(<DashboardOverviewPage />)
  },
  {
    name: 'Content Analytics',
    path: '/dashboard/content',
    element: withLayout(<ContentPage />)
  },
  {
    name: 'Audience Analytics',
    path: '/dashboard/audience',
    element: withLayout(<AudiencePage />)
  },
  {
    name: 'Growth Analytics',
    path: '/dashboard/growth',
    element: withLayout(<GrowthPage />)
  },
  {
    name: 'Social Accounts',
    path: '/dashboard/social',
    element: withLayout(<SocialAccountsPage />)
  },
  {
    name: 'YouTube Analytics',
    path: '/dashboard/youtube',
    element: withLayout(<YouTubeAnalyticsPage />)
  },
{
  name: 'Instagram Analytics',
  path: '/dashboard/instagram',
  element: withLayout(<InstagramPage />)
},
  {
    name: 'LinkedIn Analytics',
    path: '/dashboard/linkedin',
    element: withLayout(<LinkedInAnalyticsPage />)
  },
  {
  name: 'GitHub Analytics',
  path: '/dashboard/github',
  element: withLayout(<GitHubAnalyticsPage />)
},
  {
    name: 'Revenue Analytics',
    path: '/dashboard/revenue',
    element: withLayout(<RevenuePage />)
  },
  {
    name: 'Sponsorship Deals',
    path: '/dashboard/sponsorships',
    element: withLayout(<SponsorshipsPage />)
  },
  {
    name: 'Reports & Exports',
    path: '/dashboard/reports',
    element: withLayout(<ReportsPage />)
  },
  {
    name: 'Notifications Center',
    path: '/dashboard/notifications',
    element: withLayout(<NotificationsPage />)
  },
  {
    name: 'Settings',
    path: '/dashboard/settings',
    element: withLayout(<SettingsPage />)
  }
];