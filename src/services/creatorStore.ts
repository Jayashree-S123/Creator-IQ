import type {
  CreatorUser,
  ContentItem,
  SponsorshipDeal,
  RevenueRecord,
  ConnectedAccount,
  CreatorNotification,
  PlatformType,
  ContentFormat,
  DealStage,
  RevenueCategory
} from '@/types/creator';

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

const STORAGE_KEY = 'creator_iq_state_v1';

const INITIAL_USER: CreatorUser = {
  id: 'user-001',
  name: 'Alex Rivera',
  email: 'alex@creatoriq.dev',
  handle: '@alexrivera_tech',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Full-time tech creator, gear reviewer & digital workflow enthusiast. Exploring the intersection of AI, hardware, and productivity.',
  category: 'Tech & Lifestyle',
  location: 'San Francisco, CA',
  website: 'https://alexrivera.io',
  memberSince: 'January 2024'
};

const INITIAL_CONTENT: ContentItem[] = [
  {
    id: 'c-1',
    title: 'Top 10 AI Tools That Changed My Productivity in 2026',
    platform: 'youtube',
    format: 'video',
    publishDate: '2026-09-18',
    views: 184500,
    likes: 12400,
    comments: 890,
    shares: 1420,
    engagementRate: 8.0,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    url: 'https://youtube.com/watch?v=demo1',
    status: 'published'
  },
  {
    id: 'c-2',
    title: 'Clean Minimalist Desk Setup 2026 — Ultimate Tour',
    platform: 'youtube',
    format: 'video',
    publishDate: '2026-09-12',
    views: 312000,
    likes: 24800,
    comments: 1650,
    shares: 3100,
    engagementRate: 9.4,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    url: 'https://youtube.com/watch?v=demo2',
    status: 'published'
  },
  {
    id: 'c-3',
    title: '3 Secret Mac Shortcuts Nobody Uses #shorts #tech',
    platform: 'youtube',
    format: 'short',
    publishDate: '2026-09-21',
    views: 94200,
    likes: 8100,
    comments: 420,
    shares: 890,
    engagementRate: 10.0,
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    url: 'https://youtube.com/shorts/demo3',
    status: 'published'
  },
  {
    id: 'c-4',
    title: 'Behind the scenes: testing the newest foldable studio monitor',
    platform: 'instagram',
    format: 'post',
    publishDate: '2026-09-19',
    views: 68400,
    likes: 6200,
    comments: 310,
    shares: 440,
    engagementRate: 10.1,
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    url: 'https://instagram.com/p/demo4',
    status: 'published'
  },
  {
    id: 'c-5',
    title: 'POV: Editing 4K 120fps video on battery power in a cafe',
    platform: 'tiktok',
    format: 'video',
    publishDate: '2026-09-20',
    views: 145000,
    likes: 18900,
    comments: 1120,
    shares: 2400,
    engagementRate: 15.4,
    thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    url: 'https://tiktok.com/@alex/video/demo5',
    status: 'published'
  },
  {
    id: 'c-6',
    title: 'Why I am officially switching from Chrome to Zen Browser',
    platform: 'twitter',
    format: 'post',
    publishDate: '2026-09-17',
    views: 42100,
    likes: 1980,
    comments: 245,
    shares: 610,
    engagementRate: 6.7,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    url: 'https://twitter.com/alex/status/demo6',
    status: 'published'
  },
  {
    id: 'c-7',
    title: 'Live Q&A: Building your creator stack & gear review breakdown',
    platform: 'twitch',
    format: 'stream',
    publishDate: '2026-09-15',
    views: 24600,
    likes: 3100,
    comments: 1850,
    shares: 310,
    engagementRate: 21.3,
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    url: 'https://twitch.tv/videos/demo7',
    status: 'published'
  },
  {
    id: 'c-8',
    title: 'The Future of Neural Audio Interfaces (Upcoming Video)',
    platform: 'youtube',
    format: 'video',
    publishDate: '2026-09-28',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    engagementRate: 0,
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    url: '#',
    status: 'scheduled'
  }
];

const INITIAL_DEALS: SponsorshipDeal[] = [
  {
    id: 'd-1',
    brand: 'Notion',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80',
    contactPerson: 'Sarah Jenkins',
    contactEmail: 'sjenkins@mktg-notion.com',
    dealValue: 6500,
    stage: 'in_progress',
    platform: 'youtube',
    deliverables: '1x Dedicated 60s Integration + Link in Bio for 30 days',
    dueDate: '2026-10-05',
    notes: 'Script draft approved. Waiting for test tracking link.'
  },
  {
    id: 'd-2',
    brand: 'Ridge Wallet',
    logo: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=100&q=80',
    contactPerson: 'David Ross',
    contactEmail: 'partnerships@ridge-demo.com',
    dealValue: 4200,
    stage: 'in_progress',
    platform: 'youtube',
    deliverables: '1x 45s Pre-roll integration + 1x Instagram Reel',
    dueDate: '2026-09-30',
    notes: 'Product sample received. Filming scheduled this weekend.'
  },
  {
    id: 'd-3',
    brand: 'NordVPN',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=100&q=80',
    contactPerson: 'Elena Rostova',
    contactEmail: 'affiliates@nord-network.eu',
    dealValue: 8000,
    stage: 'negotiation',
    platform: 'youtube',
    deliverables: '2x 60s Mid-roll sponsorships across October tech videos',
    dueDate: '2026-10-15',
    notes: 'Requested higher CPM due to Q4 spike in views.'
  },
  {
    id: 'd-4',
    brand: 'Sony Electronics',
    logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=100&q=80',
    contactPerson: 'Kenji Takahashi',
    contactEmail: 'creators@sony-pr.jp',
    dealValue: 12000,
    stage: 'pitching',
    platform: 'youtube',
    deliverables: 'New Camera Launch Exclusive Review Video + Social carousel',
    dueDate: '2026-11-01',
    notes: 'Sent media kit and recent engagement benchmarks.'
  },
  {
    id: 'd-5',
    brand: 'Anker Innovations',
    logo: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=100&q=80',
    contactPerson: 'Marcus Vance',
    contactEmail: 'pr@anker-tech.com',
    dealValue: 5000,
    stage: 'completed',
    platform: 'youtube',
    deliverables: 'Desk power station integration + affiliate pinned comment',
    dueDate: '2026-09-10',
    notes: 'Video published, reached 312k views. Invoice sent.'
  },
  {
    id: 'd-6',
    brand: 'Epidemic Sound',
    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80',
    contactPerson: 'Astrid Lind',
    contactEmail: 'brand@epidemicsound-demo.se',
    dealValue: 3500,
    stage: 'paid',
    platform: 'youtube',
    deliverables: 'Music track shoutout and description link banner',
    dueDate: '2026-08-28',
    paidDate: '2026-09-05',
    notes: 'Payment confirmed via direct ACH wire.'
  },
  {
    id: 'd-7',
    brand: 'Squarespace',
    logo: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=100&q=80',
    contactPerson: 'Lisa Wu',
    contactEmail: 'creator-team@squarespace-demo.com',
    dealValue: 7500,
    stage: 'prospect',
    platform: 'youtube',
    deliverables: 'Portfolio website showcase video integration',
    dueDate: '2026-10-25',
    notes: 'Initial outreach made via Agency email.'
  }
];

const INITIAL_REVENUE: RevenueRecord[] = [
  {
    id: 'rev-1',
    source: 'sponsorship',
    brandOrPayer: 'Epidemic Sound',
    platform: 'youtube',
    amount: 3500,
    date: '2026-09-05',
    status: 'received',
    description: 'Q3 Brand Sponsorship payout for August video'
  },
  {
    id: 'rev-2',
    source: 'adsense',
    brandOrPayer: 'Google YouTube AdSense',
    platform: 'youtube',
    amount: 4820,
    date: '2026-09-21',
    status: 'received',
    description: 'August 2026 Creator Revenue share payout'
  },
  {
    id: 'rev-3',
    source: 'sponsorship',
    brandOrPayer: 'Anker Innovations',
    platform: 'youtube',
    amount: 5000,
    date: '2026-09-12',
    status: 'pending',
    description: 'Power Station video review sponsorship (Net-30)'
  },
  {
    id: 'rev-4',
    source: 'affiliate',
    brandOrPayer: 'Amazon Associates',
    platform: 'youtube',
    amount: 1420,
    date: '2026-09-15',
    status: 'received',
    description: 'Desk setup camera & monitor affiliate commissions'
  },
  {
    id: 'rev-5',
    source: 'merch',
    brandOrPayer: 'CreatorIQ Merch / Fourthwall',
    platform: 'youtube',
    amount: 890,
    date: '2026-09-18',
    status: 'received',
    description: 'Limited edition Desk Mat & Keycap drop sales'
  },
  {
    id: 'rev-6',
    source: 'sponsorship',
    brandOrPayer: 'Notion',
    platform: 'youtube',
    amount: 6500,
    date: '2026-10-05',
    status: 'invoiced',
    description: 'Fall AI workflow integration deal'
  },
  {
    id: 'rev-7',
    source: 'affiliate',
    brandOrPayer: 'NordVPN Affiliates',
    platform: 'youtube',
    amount: 980,
    date: '2026-09-10',
    status: 'received',
    description: 'Recurring monthly VPN subscription conversions'
  }
];

const INITIAL_ACCOUNTS: ConnectedAccount[] = [
  {
    platform: 'youtube',
    name: 'Alex Rivera Tech',
    handle: '@alexrivera_tech',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    connected: true,
    followers: 542800,
    syncStatus: 'synced',
    lastSynced: '10 minutes ago',
    profileUrl: 'https://youtube.com/@alexrivera_tech'
  },
  {
    platform: 'instagram',
    name: 'Alex Rivera',
    handle: '@alexrivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    connected: true,
    followers: 284200,
    syncStatus: 'synced',
    lastSynced: '25 minutes ago',
    profileUrl: 'https://instagram.com/alexrivera'
  },
  {
    platform: 'tiktok',
    name: 'Alex Rivera Creative',
    handle: '@alexrivera.tok',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    connected: true,
    followers: 412500,
    syncStatus: 'synced',
    lastSynced: '1 hour ago',
    profileUrl: 'https://tiktok.com/@alexrivera.tok'
  },
  {
    platform: 'twitter',
    name: 'Alex Rivera ⚡',
    handle: '@alexrivera_dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    connected: true,
    followers: 98400,
    syncStatus: 'synced',
    lastSynced: '3 hours ago',
    profileUrl: 'https://x.com/alexrivera_dev'
  },
  {
    platform: 'twitch',
    name: 'AlexLiveStreams',
    handle: 'alexlivestreams',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    connected: false,
    followers: 35100,
    syncStatus: 'disconnected',
    lastSynced: 'Never',
    profileUrl: 'https://twitch.tv/alexlivestreams'
  },
  {
    platform: 'linkedin',
    name: 'Priya Tech',
    handle: '@priya-tech',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    connected: true,
    followers: 25400,
    syncStatus: 'synced',
    lastSynced: 'Just now',
    profileUrl: 'https://www.linkedin.com/in/mock-priya-tech'
  }
];

  

const INITIAL_NOTIFICATIONS: CreatorNotification[] = [
  {
    id: 'n-1',
    title: 'New Sponsorship Milestone',
    message: 'Epidemic Sound sent confirmation for your $3,500 wire payment.',
    type: 'deal',
    timestamp: '2 hours ago',
    read: false,
    link: '/dashboard/sponsorships'
  },
  {
    id: 'n-2',
    title: 'YouTube Milestone Reached! 🚀',
    message: 'Your video "Clean Minimalist Desk Setup 2026" crossed 300,000 views!',
    type: 'milestone',
    timestamp: '5 hours ago',
    read: false,
    link: '/dashboard/youtube'
  },
  {
    id: 'n-3',
    title: 'Deal Reminder: Ridge Wallet',
    message: 'Sponsorship video deliverable is due in 6 days (Sept 30, 2026).',
    type: 'alert',
    timestamp: '1 day ago',
    read: false,
    link: '/dashboard/sponsorships'
  },
  {
    id: 'n-4',
    title: 'Instagram Account Sync Complete',
    message: '284,200 followers synced with 4 new post engagement updates.',
    type: 'system',
    timestamp: '2 days ago',
    read: true,
    link: '/dashboard/social'
  },
  {
    id: 'n-5',
    title: 'Monthly Analytics Report Ready',
    message: 'Your August 2026 comprehensive performance report is ready for export.',
    type: 'system',
    timestamp: '3 days ago',
    read: true,
    link: '/dashboard/reports'
  }
];

export const INITIAL_STATE: CreatorStoreState = {
  currentUser: INITIAL_USER,
  users: [
    {
      user: INITIAL_USER,
      passwordHash: 'creator123'
    }
  ],
  content: INITIAL_CONTENT,
  deals: INITIAL_DEALS,
  revenue: INITIAL_REVENUE,
  accounts: INITIAL_ACCOUNTS,
  notifications: INITIAL_NOTIFICATIONS,
  settings: {
    theme: 'dark',
    currency: 'USD ($)',
    dateFormat: 'MM/DD/YYYY',
    emailAlerts: true,
    dealReminders: true,
    weeklyDigest: true,
    soundEnabled: true
  }
};

export class CreatorStore {
  private static state: CreatorStoreState | null = null;
  private static listeners: Array<() => void> = [];

  static getState(): CreatorStoreState {
    if (this.state) {
      return this.state;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
        // Ensure dark theme is applied on html root
        if (this.state?.settings?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return this.state!;
      }
    } catch (e) {
      console.error('Failed to load store from localStorage', e);
    }

    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.saveState();
    return this.state!;
  }

  static saveState(): void {
    if (!this.state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save store to localStorage', e);
    }
    this.notify();
  }

  static subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  static resetToDemo(): void {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.saveState();
  }

  // --- Auth Methods ---

  static setCurrentUser(user: CreatorUser): void {
    const s = this.getState();
    s.currentUser = user;

    const existingIndex = s.users.findIndex(
      u => u.user.email.toLowerCase() === user.email.toLowerCase()
    );

    if (existingIndex === -1) {
      s.users.push({
        user,
        passwordHash: ''
      });
    } else {
      s.users[existingIndex].user = user;
    }

    this.saveState();
  }


  static login(email: string, password: string): { success: boolean; error?: string; user?: CreatorUser } {
    const s = this.getState();
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if user exists
    const record = s.users.find(u => u.user.email.toLowerCase() === cleanEmail);
    if (!record) {
      return { success: false, error: 'User with this email not found. You can register or use demo login.' };
    }

    if (record.passwordHash !== password && password !== 'creator123') {
      return { success: false, error: 'Invalid password. Try "creator123" for demo accounts.' };
    }

    s.currentUser = record.user;
    this.saveState();
    return { success: true, user: record.user };
  }

  static loginDemo(): CreatorUser {
    const s = this.getState();
    s.currentUser = INITIAL_USER;
    // Ensure in users list
    if (!s.users.some(u => u.user.id === INITIAL_USER.id)) {
      s.users.push({ user: INITIAL_USER, passwordHash: 'creator123' });
    }
    this.saveState();
    return INITIAL_USER;
  }

  static register(data: { name: string; email: string; password: string; category?: string; handle?: string }): { success: boolean; error?: string; user?: CreatorUser } {
    const s = this.getState();
    const cleanEmail = data.email.trim().toLowerCase();

    if (s.users.some(u => u.user.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newUser: CreatorUser = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      handle: data.handle?.trim() || `@${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Digital content creator sharing perspectives with the world.',
      category: data.category || 'Creator & Influencer',
      location: 'Global',
      website: 'https://creatoriq.dev',
      memberSince: 'Just joined'
    };

    s.users.push({ user: newUser, passwordHash: data.password });
    s.currentUser = newUser;
    this.saveState();
    return { success: true, user: newUser };
  }

  static logout(): void {
    const s = this.getState();
    s.currentUser = null;
    this.saveState();
  }

  static updateProfile(updates: Partial<CreatorUser>): void {
    const s = this.getState();
    if (!s.currentUser) return;
    s.currentUser = { ...s.currentUser, ...updates };
    // update in users array too
    const idx = s.users.findIndex(u => u.user.id === s.currentUser?.id);
    if (idx !== -1) {
      s.users[idx].user = s.currentUser;
    }
    this.saveState();
  }

  // --- Content CRUD ---
  static addContent(item: Omit<ContentItem, 'id'>): ContentItem {
    const s = this.getState();
    const newItem: ContentItem = {
      ...item,
      id: `c-${Date.now()}`
    };
    s.content = [newItem, ...s.content];
    this.saveState();
    return newItem;
  }

  static updateContent(id: string, updates: Partial<ContentItem>): void {
    const s = this.getState();
    s.content = s.content.map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveState();
  }

  static deleteContent(id: string): void {
    const s = this.getState();
    s.content = s.content.filter(c => c.id !== id);
    this.saveState();
  }

  // --- Deals CRUD ---
  static addDeal(deal: Omit<SponsorshipDeal, 'id'>): SponsorshipDeal {
    const s = this.getState();
    const newDeal: SponsorshipDeal = {
      ...deal,
      id: `d-${Date.now()}`
    };
    s.deals = [newDeal, ...s.deals];
    
    // Add notification
    s.notifications = [
      {
        id: `n-${Date.now()}`,
        title: 'New Deal Added',
        message: `Brand deal with ${newDeal.brand} ($${newDeal.dealValue.toLocaleString()}) created.`,
        type: 'deal',
        timestamp: 'Just now',
        read: false,
        link: '/dashboard/sponsorships'
      },
      ...s.notifications
    ];

    this.saveState();
    return newDeal;
  }

  static updateDeal(id: string, updates: Partial<SponsorshipDeal>): void {
    const s = this.getState();
    s.deals = s.deals.map(d => d.id === id ? { ...d, ...updates } : d);
    this.saveState();
  }

  static deleteDeal(id: string): void {
    const s = this.getState();
    s.deals = s.deals.filter(d => d.id !== id);
    this.saveState();
  }

  // --- Revenue CRUD ---
  static addRevenue(record: Omit<RevenueRecord, 'id'>): RevenueRecord {
    const s = this.getState();
    const newRev: RevenueRecord = {
      ...record,
      id: `rev-${Date.now()}`
    };
    s.revenue = [newRev, ...s.revenue];
    this.saveState();
    return newRev;
  }

  static updateRevenue(id: string, updates: Partial<RevenueRecord>): void {
    const s = this.getState();
    s.revenue = s.revenue.map(r => r.id === id ? { ...r, ...updates } : r);
    this.saveState();
  }

  static deleteRevenue(id: string): void {
    const s = this.getState();
    s.revenue = s.revenue.filter(r => r.id !== id);
    this.saveState();
  }

  // --- Accounts CRUD ---
  static toggleAccount(platform: PlatformType): void {
    const s = this.getState();
    s.accounts = s.accounts.map(acc => {
      if (acc.platform === platform) {
        const nextConnected = !acc.connected;
        return {
          ...acc,
          connected: nextConnected,
          syncStatus: nextConnected ? 'synced' : 'disconnected',
          lastSynced: nextConnected ? 'Just now' : 'Disconnected'
        };
      }
      return acc;
    });

    s.notifications = [
      {
        id: `n-${Date.now()}`,
        title: 'Social Account Updated',
        message: `Account status for ${platform.toUpperCase()} was updated.`,
        type: 'system',
        timestamp: 'Just now',
        read: false,
        link: '/dashboard/social'
      },
      ...s.notifications
    ];

    this.saveState();
  }

  static syncAccount(platform: PlatformType): void {
    const s = this.getState();
    s.accounts = s.accounts.map(acc => {
      if (acc.platform === platform) {
        return {
          ...acc,
          syncStatus: 'synced',
          lastSynced: 'Just now'
        };
      }
      return acc;
    });
    this.saveState();
  }

  // --- Notifications CRUD ---
  static markNotificationRead(id: string): void {
    const s = this.getState();
    s.notifications = s.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.saveState();
  }

  static markAllNotificationsRead(): void {
    const s = this.getState();
    s.notifications = s.notifications.map(n => ({ ...n, read: true }));
    this.saveState();
  }

  static deleteNotification(id: string): void {
    const s = this.getState();
    s.notifications = s.notifications.filter(n => n.id !== id);
    this.saveState();
  }

  // --- Theme & Settings ---
  static toggleTheme(): 'dark' | 'light' {
    const s = this.getState();
    const nextTheme = s.settings.theme === 'dark' ? 'light' : 'dark';
    s.settings.theme = nextTheme;
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.saveState();
    return nextTheme;
  }

  static updateSettings(settings: Partial<CreatorStoreState['settings']>): void {
    const s = this.getState();
    s.settings = { ...s.settings, ...settings };
    if (s.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.saveState();
  }
}