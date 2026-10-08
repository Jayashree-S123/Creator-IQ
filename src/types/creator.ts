export type PlatformType =
  'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'twitch' | 'linkedin';

export type ContentFormat =
  'video' | 'short' | 'post' | 'stream';

export type DealStage =
  'prospect' | 'pitching' | 'negotiation' | 'in_progress' | 'completed' | 'paid';

export type RevenueCategory =
  'adsense' | 'sponsorship' | 'merch' | 'affiliate';

export interface CreatorUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  bio: string;
  category: string;
  location: string;
  website: string;
  memberSince: string;
}

export interface ContentItem {
  id: string;
  title: string;
  platform: PlatformType;
  format: ContentFormat;
  publishDate: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  thumbnail: string;
  url: string;
  status: 'published' | 'scheduled' | 'draft';
}

export interface SponsorshipDeal {
  id: string;
  brand: string;
  logo?: string;
  contactPerson: string;
  contactEmail: string;
  dealValue: number;
  stage: DealStage;
  platform: PlatformType;
  deliverables: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
}

export interface RevenueRecord {
  id: string;
  source: RevenueCategory;
  brandOrPayer: string;
  platform: PlatformType;
  amount: number;
  date: string;
  status: 'received' | 'pending' | 'invoiced';
  description: string;
}

export interface ConnectedAccount {
  platform: PlatformType;
  name: string;
  handle: string;
  avatar: string;
  connected: boolean;
  followers: number;
  syncStatus: 'synced' | 'syncing' | 'error' | 'disconnected';
  lastSynced: string;
  profileUrl: string;
}

export interface CreatorNotification {
  id: string;
  title: string;
  message: string;
  type: 'deal' | 'milestone' | 'system' | 'alert';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface CreatorStoreState {
  currentUser: CreatorUser | null;
  users: Array<{ user: CreatorUser; passwordHash: string }>;
  content: ContentItem[];
  deals: SponsorshipDeal[];
  revenue: RevenueRecord[];
  accounts: ConnectedAccount[];
  notifications: CreatorNotification[];
  settings: {
    theme: 'dark' | 'light';
    currency: string;
    dateFormat: string;
    emailAlerts: boolean;
    dealReminders: boolean;
    weeklyDigest: boolean;
    soundEnabled: boolean;
  };
}

export interface OverviewMetrics {
  totalReach: number;
  reachChange: number;
  engagementRate: number;
  engagementChange: number;
  monthlyRevenue: number;
  revenueChange: number;
  activeDeals: number;
  activeDealsValue: number;
}