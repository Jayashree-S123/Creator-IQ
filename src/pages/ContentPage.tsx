import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit2,
  Eye,
  FileVideo,
  Filter,
  Heart,
  MessageSquare,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Video,
  X,
  Youtube,
  Zap,
} from 'lucide-react';

import { useCreatorAuth } from '../contexts/CreatorAuthContext';
import { ContentItem, PlatformType, ContentFormat } from '../types';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';


const API_URL = 'http://127.0.0.1:8000';

type DataSource = 'youtube' | 'database' | 'all';

interface BackendContent {
  id: number;
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  watch_time?: number;
  reach?: number;
  engagement_rate?: number;
}

interface ContentSummary {
  total_content: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  total_reach: number;
  engagement_rate: number;
}

interface TopContent {
  id: number;
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
}

interface YouTubeChannel {
  id: string;
  name: string;
  handle?: string;
  description?: string;
  subscribers?: number;
  subscriber_change?: number;
  views?: number;
  likes?: number;
  comments?: number;
  watch_time_hours?: number;
  watch_time_change?: number;
  impressions?: number;
  ctr?: number;
  avg_view_duration?: number;
  retention?: number;
  videos?: number;
  verified_partner?: boolean;
}

interface YouTubeVideo {
  id?: string;
  videoId?: string;
  title: string;
  views?: number;
  watch_hours?: number;
  ctr?: number;
  duration?: number;
  retention?: number;
  channelId?: string;
  channelName?: string;
  thumbnail?: string;
  url?: string;
}

type DisplayContent = ContentItem & {
  source: 'database' | 'youtube';
  channelName?: string;
  watchHours?: number;
  ctr?: number;
  retention?: number;
};

const platformLabels: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'X / Twitter',
  twitch: 'Twitch',
};

const platformColors: Record<string, string> = {
  youtube: 'bg-red-50 text-red-600 border-red-200',
  instagram: 'bg-pink-50 text-pink-600 border-pink-200',
  tiktok: 'bg-slate-100 text-slate-800 border-slate-300',
  twitter: 'bg-blue-50 text-blue-600 border-blue-200',
  twitch: 'bg-purple-50 text-purple-600 border-purple-200',
};

const formatNumber = (value = 0) => {
  if (!Number.isFinite(value)) return '0';

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toLocaleString();
};

const formatPercent = (value = 0) => `${value.toFixed(2)}%`;

const formatHours = (value = 0) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K h`;
  }

  return `${value.toFixed(1)} h`;
};

const mapPlatform = (platform: string): PlatformType => {
  const normalized = platform?.toLowerCase();

  if (normalized === 'instagram') return 'instagram';
  if (normalized === 'tiktok') return 'tiktok';
  if (normalized === 'twitter' || normalized === 'x') return 'twitter';
  if (normalized === 'twitch') return 'twitch';

  return 'youtube';
};

const mapBackendContent = (item: BackendContent): DisplayContent => {
  return {
    id: String(item.id),
    title: item.title,
    platform: mapPlatform(item.platform),
    format: 'video' as ContentFormat,
    views: item.views || 0,
    likes: item.likes || 0,
    comments: item.comments || 0,
    shares: item.shares || 0,
    publishDate: new Date().toISOString(),
    thumbnail:
      'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80',
    url: '#',
    status: 'published',
    engagementRate: item.engagement_rate || 0,
    source: 'database',
  };
};

const mapYouTubeVideo = (
  item: YouTubeVideo,
  channelId: string,
  channelName: string,
  index: number
): DisplayContent => {
  const videoId = item.videoId || item.id;

  return {
    id: `youtube-${channelId}-${videoId || index}`,
    title: item.title,
    platform: 'youtube',
    format: 'video' as ContentFormat,
    views: item.views || 0,
    likes: 0,
    comments: 0,
    shares: 0,
    publishDate: new Date().toISOString(),
    thumbnail:
      item.thumbnail ||
      'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80',
    url: item.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#'),
    status: 'published',
    engagementRate: item.ctr || 0,
    source: 'youtube',
    channelName,
    watchHours: item.watch_hours || 0,
    ctr: item.ctr || 0,
    retention: item.retention || 0,
  };
};

const getToken = () => {
  return localStorage.getItem('creatoriq_token');
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'blue',
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'slate';
}) => {
  const accents = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>

          <div className={`rounded-xl p-3 ${accents[accent]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const Metric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2">
    <div className="text-slate-400">{icon}</div>
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-700">{value}</p>
    </div>
  </div>
);

export default function ContentPage() {
  const { state } = useCreatorAuth();
  const showMessage = (message: string) => window.alert(message);

  const [backendContent, setBackendContent] = useState<DisplayContent[]>([]);
  const [youtubeContent, setYoutubeContent] = useState<DisplayContent[]>([]);
  const [youtubeChannels, setYoutubeChannels] = useState<YouTubeChannel[]>([]);

  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);

  const [dataSource, setDataSource] = useState<DataSource>('youtube');
  const [selectedChannel, setSelectedChannel] = useState('all');

  const [summary, setSummary] = useState<ContentSummary>({
    total_content: 0,
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    total_saves: 0,
    total_reach: 0,
    engagement_rate: 0,
  });

  const [topContent, setTopContent] = useState<TopContent[]>([]);
  const [chartData, setChartData] = useState<
    Array<{
      name: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
    }>
  >([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DisplayContent | null>(null);

  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [format, setFormat] = useState('video');
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('published');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DisplayContent | null>(
    null
  );

  const [refreshing, setRefreshing] = useState(false);

  const fetchContent = async () => {
    try {
      const token = getToken();

      if (!token) {
        setBackendContent([]);
        return;
      }

      const response = await fetch(`${API_URL}/content/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      setBackendContent(
        Array.isArray(data.content)
          ? data.content.map(mapBackendContent)
          : []
      );
    } catch (error) {
      console.error('Failed to fetch database content:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(`${API_URL}/content/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      setSummary({
        total_content: data.total_content || 0,
        total_views: data.total_views || 0,
        total_likes: data.total_likes || 0,
        total_comments: data.total_comments || 0,
        total_shares: data.total_shares || 0,
        total_saves: data.total_saves || 0,
        total_reach: data.total_reach || 0,
        engagement_rate: data.engagement_rate || 0,
      });
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const fetchTopContent = async () => {
    try {
      const token = getToken();

      if (!token) return;

      const response = await fetch(`${API_URL}/content/top`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      setTopContent(Array.isArray(data.top_content) ? data.top_content : []);
    } catch (error) {
      console.error('Failed to fetch top content:', error);
    }
  };

  const fetchYouTubeContent = async () => {
    setYoutubeLoading(true);

    try {
      const response = await fetch(`${API_URL}/youtube/analytics/channels`, {
        headers: {
          Authorization: `Bearer ${getToken() || ''}`,
        },
      });

      if (!response.ok) {
        setYoutubeChannels([]);
        setYoutubeContent([]);
        return;
      }

      const data = await response.json();

      const channels: YouTubeChannel[] = Array.isArray(data.channels)
        ? data.channels
        : [];

      setYoutubeChannels(channels);

      if (!channels.length) {
        setYoutubeContent([]);
        return;
      }

      const results = await Promise.allSettled(
        channels.map(async (channel) => {
          const videoResponse = await fetch(
            `${API_URL}/youtube/analytics/videos/${channel.id}`,
            {
              headers: {
                Authorization: `Bearer ${getToken() || ''}`,
              },
            }
          );

          if (!videoResponse.ok) {
            throw new Error(
              `Failed to fetch videos for channel ${channel.name}`
            );
          }

          const videoData = await videoResponse.json();

          return {
            channel,
            videos: Array.isArray(videoData.videos)
              ? videoData.videos
              : [],
          };
        })
      );

      const allVideos: DisplayContent[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          result.value.videos.forEach(
            (video: YouTubeVideo, index: number) => {
              allVideos.push(
                mapYouTubeVideo(
                  video,
                  result.value.channel.id,
                  result.value.channel.name,
                  index
                )
              );
            }
          );
        }
      });

      setYoutubeContent(allVideos);
    } catch (error) {
      console.error('Failed to fetch YouTube analytics:', error);

      toast({
        title: 'YouTube analytics unavailable',
        description:
          'The Content page could not load YouTube analytics right now.',
        variant: 'destructive',
      });
    } finally {
      setYoutubeLoading(false);
      setLoadingContent(false);
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        fetchContent(),
        fetchSummary(),
        fetchTopContent(),
        fetchYouTubeContent(),
      ]);

      toast({
        title: 'Content refreshed',
        description: 'Your latest analytics have been loaded.',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoadingContent(true);

      await Promise.all([
        fetchContent(),
        fetchSummary(),
        fetchTopContent(),
        fetchYouTubeContent(),
      ]);
    };

    load();
  }, []);

  const displayedSourceContent = useMemo(() => {
    if (dataSource === 'database') return backendContent;
    if (dataSource === 'youtube') return youtubeContent;

    return [...youtubeContent, ...backendContent];
  }, [dataSource, backendContent, youtubeContent]);

  const filteredItems = useMemo(() => {
    let items = displayedSourceContent;

    if (selectedChannel !== 'all') {
      items = items.filter(
        (item) => item.channelName === selectedChannel
      );
    }

    return items.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesPlatform =
        platformFilter === 'all' ||
        item.platform.toLowerCase() === platformFilter.toLowerCase();

      const matchesFormat =
        formatFilter === 'all' ||
        String(item.format).toLowerCase() === formatFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' ||
        String(item.status).toLowerCase() === statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesPlatform &&
        matchesFormat &&
        matchesStatus
      );
    });
  }, [
    displayedSourceContent,
    selectedChannel,
    searchTerm,
    platformFilter,
    formatFilter,
    statusFilter,
  ]);

  const displaySummary = useMemo(() => {
    if (dataSource === 'database') {
      return {
        totalContent: summary.total_content,
        totalViews: summary.total_views,
        totalLikes: summary.total_likes,
        totalComments: summary.total_comments,
        totalReach: summary.total_reach,
        engagementRate: summary.engagement_rate,
        avgCtr: 0,
        watchHours: 0,
      };
    }

    const totalViews = filteredItems.reduce(
      (sum, item) => sum + (item.views || 0),
      0
    );

    const totalLikes = filteredItems.reduce(
      (sum, item) => sum + (item.likes || 0),
      0
    );

    const totalComments = filteredItems.reduce(
      (sum, item) => sum + (item.comments || 0),
      0
    );

    const totalReach = totalViews;

    const ctrValues = filteredItems
      .map((item) => item.ctr || 0)
      .filter((value) => value > 0);

    const avgCtr = ctrValues.length
      ? ctrValues.reduce((sum, value) => sum + value, 0) /
        ctrValues.length
      : 0;

    const watchHours = filteredItems.reduce(
      (sum, item) => sum + (item.watchHours || 0),
      0
    );

    const engagementRate =
      totalViews > 0
        ? ((totalLikes + totalComments) / totalViews) * 100
        : 0;

    return {
      totalContent: filteredItems.length,
      totalViews,
      totalLikes,
      totalComments,
      totalReach,
      engagementRate,
      avgCtr,
      watchHours,
    };
  }, [dataSource, summary, filteredItems]);

  useEffect(() => {
    const data = filteredItems
      .slice(0, 10)
      .map((item) => ({
        name:
          item.title.length > 18
            ? `${item.title.slice(0, 18)}…`
            : item.title,
        views: item.views || 0,
        likes: item.likes || 0,
        comments: item.comments || 0,
        shares: item.shares || 0,
      }));

    setChartData(data);
  }, [filteredItems]);

  const displayTopContent = useMemo(() => {
    if (
      dataSource === 'database' &&
      selectedChannel === 'all' &&
      !searchTerm &&
      platformFilter === 'all' &&
      formatFilter === 'all' &&
      statusFilter === 'all'
    ) {
      return topContent.slice(0, 5).map((item) => ({
        title: item.title,
        platform: item.platform,
        views: item.views,
        likes: item.likes,
        comments: item.comments,
        engagementRate: item.engagement_rate || 0,
      }));
    }

    return [...filteredItems]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((item) => ({
        title: item.title,
        platform: item.platform,
        views: item.views || 0,
        likes: item.likes || 0,
        comments: item.comments || 0,
        engagementRate: item.ctr || item.engagementRate || 0,
      }));
  }, [
    dataSource,
    selectedChannel,
    searchTerm,
    platformFilter,
    formatFilter,
    statusFilter,
    topContent,
    filteredItems,
  ]);

  const bestPerformer = useMemo(() => {
    return [...filteredItems].sort(
      (a, b) => (b.views || 0) - (a.views || 0)
    )[0];
  }, [filteredItems]);

  const bestCtr = useMemo(() => {
    return [...filteredItems]
      .filter((item) => (item.ctr || 0) > 0)
      .sort((a, b) => (b.ctr || 0) - (a.ctr || 0))[0];
  }, [filteredItems]);

  const bestRetention = useMemo(() => {
    return [...filteredItems]
      .filter((item) => (item.retention || 0) > 0)
      .sort((a, b) => (b.retention || 0) - (a.retention || 0))[0];
  }, [filteredItems]);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setPlatform('youtube');
    setFormat('video');
    setViews('');
    setLikes('');
    setComments('');
    setShares('');
    setPublishDate('');
    setThumbnail('');
    setUrl('');
    setStatus('published');
    setModalOpen(true);
  };

  const openEditModal = (item: DisplayContent) => {
    if (item.source !== 'database') {
      toast({
        title: 'YouTube analytics are read-only',
        description:
          'YouTube Analytics content cannot be edited from this page.',
      });
      return;
    }

    setEditingItem(item);
    setTitle(item.title);
    setPlatform(item.platform);
    setFormat(String(item.format));
    setViews(String(item.views || ''));
    setLikes(String(item.likes || ''));
    setComments(String(item.comments || ''));
    setShares(String(item.shares || ''));
    setPublishDate(
      item.publishDate
        ? new Date(item.publishDate).toISOString().slice(0, 10)
        : ''
    );
    setThumbnail(item.thumbnail || '');
    setUrl(item.url || '');
    setStatus(String(item.status || 'published'));
    setModalOpen(true);
  };

  const saveContent = async () => {
    try {
      const token = getToken();

      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please log in before saving content.',
          variant: 'destructive',
        });
        return;
      }

      if (!title.trim()) {
        toast({
          title: 'Title required',
          description: 'Please enter a content title.',
          variant: 'destructive',
        });
        return;
      }

      const viewsNum = Number(views) || 0;
      const likesNum = Number(likes) || 0;
      const commentsNum = Number(comments) || 0;
      const sharesNum = Number(shares) || 0;

      const query = new URLSearchParams({
        title: title.trim(),
        platform,
        views: String(viewsNum),
        likes: String(likesNum),
        comments: String(commentsNum),
        shares: String(sharesNum),
        saves: '0',
        watch_time: '0',
        reach: String(viewsNum),
      });

      const endpoint = editingItem
        ? `${API_URL}/content/${editingItem.id}?${query.toString()}`
        : `${API_URL}/content/?${query.toString()}`;

      const response = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      toast({
        title: editingItem ? 'Content updated' : 'Content added',
        description: 'Your database content has been saved successfully.',
      });

      setModalOpen(false);

      await Promise.all([
        fetchContent(),
        fetchSummary(),
        fetchTopContent(),
      ]);
    } catch (error) {
      console.error(error);

      toast({
        title: 'Unable to save content',
        description:
          'Something went wrong while saving this content entry.',
        variant: 'destructive',
      });
    }
  };

  const askDelete = (item: DisplayContent) => {
    if (item.source !== 'database') {
      toast({
        title: 'YouTube analytics are read-only',
        description:
          'YouTube Analytics content cannot be deleted from this page.',
      });
      return;
    }

    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const deleteContent = async () => {
    if (!itemToDelete) return;

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/content/${itemToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token || ''}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast({
        title: 'Content deleted',
        description: 'The content entry was removed.',
      });

      setDeleteConfirmOpen(false);
      setItemToDelete(null);

      await Promise.all([
        fetchContent(),
        fetchSummary(),
        fetchTopContent(),
      ]);
    } catch (error) {
      console.error(error);

      toast({
        title: 'Unable to delete',
        description: 'The content could not be deleted.',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPlatformFilter('all');
    setFormatFilter('all');
    setStatusFilter('all');
    setSelectedChannel('all');
  };

  const hasFilters =
    searchTerm ||
    platformFilter !== 'all' ||
    formatFilter !== 'all' ||
    statusFilter !== 'all' ||
    selectedChannel !== 'all';

  const selectedChannelData =
    selectedChannel !== 'all'
      ? youtubeChannels.find((channel) => channel.name === selectedChannel)
      : undefined;

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <Sparkles className="h-4 w-4" />
              CREATORIQ ANALYTICS
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Content Intelligence
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
              Understand which content is driving views, engagement,
              retention and creator growth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={refreshAll}
              disabled={refreshing}
              className="bg-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </Button>

            <Button
              onClick={openAddModal}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Content Entry
            </Button>
          </div>
        </div>

        {/* DATA SOURCE */}
        <Card className="overflow-hidden border-0 bg-white shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Analytics source
                  </p>
                  <p className="text-xs text-slate-500">
                    Choose what content you want to analyze
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dataSource === 'youtube' ? 'default' : 'outline'}
                  onClick={() => {
                    setDataSource('youtube');
                    setSelectedChannel('all');
                  }}
                  className={
                    dataSource === 'youtube'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-white'
                  }
                >
                  <Youtube className="mr-2 h-4 w-4" />
                  YouTube Analytics
                </Button>

                <Button
                  variant={
                    dataSource === 'database' ? 'default' : 'outline'
                  }
                  onClick={() => {
                    setDataSource('database');
                    setSelectedChannel('all');
                  }}
                  className="bg-white"
                >
                  <FileVideo className="mr-2 h-4 w-4" />
                  Database Content
                </Button>

                <Button
                  variant={dataSource === 'all' ? 'default' : 'outline'}
                  onClick={() => setDataSource('all')}
                  className="bg-white"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  All Content
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HERO / OVERVIEW */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-xl md:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Badge className="mb-3 border-white/10 bg-white/10 text-white hover:bg-white/10">
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                LIVE PERFORMANCE OVERVIEW
              </Badge>

              <h2 className="text-2xl font-bold md:text-3xl">
                Your content at a glance
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Track your most important content signals and quickly
                identify what is performing best.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Current view
              </p>
              <p className="mt-1 text-lg font-semibold">
                {dataSource === 'youtube'
                  ? 'YouTube Analytics'
                  : dataSource === 'database'
                  ? 'Database Content'
                  : 'All Content'}
              </p>

              {selectedChannel !== 'all' && (
                <p className="mt-1 text-xs text-slate-400">
                  {selectedChannel}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title="Total Content"
            value={formatNumber(displaySummary.totalContent)}
            subtitle="Items in current view"
            icon={<Video className="h-5 w-5" />}
            accent="blue"
          />

          <StatCard
            title="Total Views"
            value={formatNumber(displaySummary.totalViews)}
            subtitle="Content views"
            icon={<Eye className="h-5 w-5" />}
            accent="red"
          />

          <StatCard
            title="Likes"
            value={formatNumber(displaySummary.totalLikes)}
            subtitle="Audience reactions"
            icon={<Heart className="h-5 w-5" />}
            accent="green"
          />

          <StatCard
            title="Comments"
            value={formatNumber(displaySummary.totalComments)}
            subtitle="Audience conversations"
            icon={<MessageSquare className="h-5 w-5" />}
            accent="purple"
          />

          <StatCard
            title={dataSource === 'youtube' ? 'Avg. CTR' : 'Engagement'}
            value={
              dataSource === 'youtube'
                ? formatPercent(displaySummary.avgCtr)
                : formatPercent(displaySummary.engagementRate)
            }
            subtitle={
              dataSource === 'youtube'
                ? 'Click-through rate'
                : 'Calculated engagement'
            }
            icon={<Target className="h-5 w-5" />}
            accent="orange"
          />

          <StatCard
            title="Watch Time"
            value={formatHours(displaySummary.watchHours)}
            subtitle={
              dataSource === 'youtube'
                ? 'YouTube watch hours'
                : 'Available analytics'
            }
            icon={<Clock3 className="h-5 w-5" />}
            accent="slate"
          />
        </div>

        {/* CHANNEL PERFORMANCE */}
        {dataSource !== 'database' && youtubeChannels.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Channel Performance
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Select a channel to analyze its content performance.
                  </p>
                </div>

                {selectedChannel !== 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChannel('all')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear channel
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <button
                  onClick={() => setSelectedChannel('all')}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selectedChannel === 'all'
                      ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>

                    {selectedChannel === 'all' && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>

                  <p className="font-semibold text-slate-900">
                    All Channels
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {youtubeChannels.length} connected channel
                    {youtubeChannels.length === 1 ? '' : 's'}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Videos</span>
                    <span className="font-semibold text-slate-700">
                      {formatNumber(
                        youtubeChannels.reduce(
                          (sum, channel) => sum + (channel.videos || 0),
                          0
                        )
                      )}
                    </span>
                  </div>
                </button>

                {youtubeChannels.map((channel) => {
                  const active = selectedChannel === channel.name;

                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.name)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? 'border-red-400 bg-red-50/70 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-red-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-2">
                        <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                          <Youtube className="h-5 w-5" />
                        </div>

                        {active ? (
                          <CheckCircle2 className="h-5 w-5 text-red-600" />
                        ) : channel.verified_partner ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-600"
                          >
                            Verified
                          </Badge>
                        ) : null}
                      </div>

                      <p className="truncate font-semibold text-slate-900">
                        {channel.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {channel.handle || 'YouTube channel'}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] text-slate-400">
                            Views
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {formatNumber(channel.views || 0)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-400">
                            Videos
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {formatNumber(channel.videos || 0)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-400">
                            CTR
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {formatPercent(channel.ctr || 0)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-400">
                            Retention
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {formatPercent(channel.retention || 0)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SELECTED CHANNEL DETAIL */}
        {selectedChannelData && (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-red-50 p-4 text-red-600">
                    <Youtube className="h-7 w-7" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {selectedChannelData.name}
                      </h3>

                      {selectedChannelData.verified_partner && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedChannelData.handle || 'YouTube Analytics'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">Subscribers</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatNumber(
                        selectedChannelData.subscribers || 0
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Views</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatNumber(selectedChannelData.views || 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">CTR</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatPercent(selectedChannelData.ctr || 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Retention</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatPercent(
                        selectedChannelData.retention || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CHART + TOP CONTENT */}
        <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Content Performance
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Compare views and engagement signals across your
                    content.
                  </p>
                </div>

                <Badge variant="outline" className="w-fit">
                  Top 10
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="h-[340px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 55,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        angle={-35}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) =>
                          formatNumber(Number(value))
                        }
                      />

                      <Tooltip
                        formatter={(value: number) =>
                          formatNumber(Number(value))
                        }
                      />

                      <Legend />

                      <Bar
                        dataKey="views"
                        name="Views"
                        radius={[5, 5, 0, 0]}
                        fill="#334155"
                      />

                      <Bar
                        dataKey="likes"
                        name="Likes"
                        radius={[5, 5, 0, 0]}
                        fill="#ef4444"
                      />

                      <Bar
                        dataKey="comments"
                        name="Comments"
                        radius={[5, 5, 0, 0]}
                        fill="#8b5cf6"
                      />

                      <Bar
                        dataKey="shares"
                        name="Shares"
                        radius={[5, 5, 0, 0]}
                        fill="#10b981"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                    <BarChart3 className="h-10 w-10 text-slate-300" />
                    <p className="mt-3 font-medium text-slate-600">
                      No performance data
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your filters or data source.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                Top Performing Content
              </CardTitle>
              <p className="text-sm text-slate-500">
                Your highest-viewed content in the current selection.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {displayTopContent.length > 0 ? (
                displayTopContent.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>

                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          {platformLabels[item.platform] ||
                            item.platform}
                        </span>
                        <span>•</span>
                        <span>{formatNumber(item.views)} views</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        {dataSource === 'youtube'
                          ? 'CTR'
                          : 'Engagement'}
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {formatPercent(item.engagementRate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No top content available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CONTENT INTELLIGENCE */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Content Intelligence
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick signals that help you understand what is working.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <Badge variant="outline">Most viewed</Badge>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Best performer
                </p>

                <h3 className="mt-2 line-clamp-2 min-h-[48px] font-bold text-slate-900">
                  {bestPerformer?.title || 'No content available'}
                </h3>

                {bestPerformer && (
                  <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {formatNumber(bestPerformer.views)} views
                    </span>
                    <span>•</span>
                    <span>
                      {platformLabels[bestPerformer.platform] ||
                        bestPerformer.platform}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    <Target className="h-5 w-5" />
                  </div>

                  <Badge variant="outline">Highest CTR</Badge>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Strongest click-through
                </p>

                <h3 className="mt-2 line-clamp-2 min-h-[48px] font-bold text-slate-900">
                  {bestCtr?.title || 'No CTR data available'}
                </h3>

                {bestCtr && (
                  <div className="mt-4 text-sm">
                    <span className="font-bold text-orange-600">
                      {formatPercent(bestCtr.ctr || 0)}
                    </span>
                    <span className="ml-2 text-slate-500">
                      click-through rate
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <Badge variant="outline">Best retention</Badge>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Audience retention
                </p>

                <h3 className="mt-2 line-clamp-2 min-h-[48px] font-bold text-slate-900">
                  {bestRetention?.title || 'No retention data available'}
                </h3>

                {bestRetention && (
                  <div className="mt-4 text-sm">
                    <span className="font-bold text-purple-600">
                      {formatPercent(bestRetention.retention || 0)}
                    </span>
                    <span className="ml-2 text-slate-500">
                      audience retention
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FILTERS */}
<Card className="border border-slate-200 bg-white shadow-sm">
  <CardContent className="p-4">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      
      {/* SEARCH */}
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search content..."
          className="h-11 border-slate-300 bg-white pl-10 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">

        {/* PLATFORM */}
        <Select
          value={platformFilter}
          onValueChange={setPlatformFilter}
        >
          <SelectTrigger className="h-11 w-[150px] border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>

          <SelectContent className="border-slate-200 bg-white text-slate-900">
            <SelectItem
              value="all"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              All platforms
            </SelectItem>

            <SelectItem
              value="youtube"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              YouTube
            </SelectItem>

            <SelectItem
              value="instagram"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Instagram
            </SelectItem>

            <SelectItem
              value="tiktok"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              TikTok
            </SelectItem>

            <SelectItem
              value="twitter"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              X / Twitter
            </SelectItem>

            <SelectItem
              value="twitch"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Twitch
            </SelectItem>
          </SelectContent>
        </Select>

        {/* FORMAT */}
        <Select
          value={formatFilter}
          onValueChange={setFormatFilter}
        >
          <SelectTrigger className="h-11 w-[145px] border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50">
            <SelectValue placeholder="Format" />
          </SelectTrigger>

          <SelectContent className="border-slate-200 bg-white text-slate-900">
            <SelectItem
              value="all"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              All formats
            </SelectItem>

            <SelectItem
              value="video"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Video
            </SelectItem>

            <SelectItem
              value="image"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Image
            </SelectItem>

            <SelectItem
              value="carousel"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Carousel
            </SelectItem>

            <SelectItem
              value="text"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Text
            </SelectItem>

            <SelectItem
              value="reel"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Reel
            </SelectItem>
          </SelectContent>
        </Select>

        {/* STATUS */}
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="h-11 w-[145px] border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent className="border-slate-200 bg-white text-slate-900">
            <SelectItem
              value="all"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              All status
            </SelectItem>

            <SelectItem
              value="published"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Published
            </SelectItem>

            <SelectItem
              value="draft"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              Draft
            </SelectItem>
          </SelectContent>
        </Select>

        {/* CHANNEL */}
        <Select
          value={selectedChannel}
          onValueChange={setSelectedChannel}
        >
          <SelectTrigger className="h-11 w-[170px] border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>

          <SelectContent className="border-slate-200 bg-white text-slate-900">
            <SelectItem
              value="all"
              className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
            >
              All channels
            </SelectItem>

            {youtubeChannels.map((channel) => (
              <SelectItem
                key={channel.id}
                value={channel.name}
                className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
              >
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* CLEAR FILTERS */}
        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="h-11 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  </CardContent>
</Card>
        {/* CONTENT LIBRARY */}
        <div>
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Content Library
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review performance at the individual content level.
              </p>
            </div>

            {selectedChannel !== 'all' && (
              <Badge
                variant="outline"
                className="w-fit border-red-200 bg-red-50 text-red-600"
              >
                <Youtube className="mr-1.5 h-3.5 w-3.5" />
                {selectedChannel}
              </Badge>
            )}
          </div>

          {loadingContent || youtubeLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((item) => (
                <Card
                  key={item}
                  className="border-0 shadow-sm animate-pulse"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-28 w-44 rounded-xl bg-slate-200" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-2/3 rounded bg-slate-200" />
                        <div className="h-4 w-1/3 rounded bg-slate-200" />
                        <div className="h-8 w-full rounded bg-slate-200" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <FileVideo className="h-8 w-8 text-slate-400" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-800">
                  No content found
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Try changing your filters, selecting another channel,
                  or add a database content entry.
                </p>

                {hasFilters && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const platformKey = String(item.platform).toLowerCase();

                return (
                  <Card
                    key={item.id}
                    className="group overflow-hidden border-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* THUMBNAIL */}
                        <div className="relative h-48 w-full shrink-0 overflow-hidden bg-slate-100 md:h-36 md:w-56">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                          <div className="absolute left-3 top-3">
                            <Badge
                              className={`border ${
                                platformColors[platformKey] ||
                                'border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              {platformKey === 'youtube' ? (
                                <Youtube className="mr-1.5 h-3.5 w-3.5" />
                              ) : (
                                <Video className="mr-1.5 h-3.5 w-3.5" />
                              )}

                              {platformLabels[platformKey] ||
                                item.platform}
                            </Badge>
                          </div>

                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            {item.source === 'youtube' ? (
                              <Badge className="border-white/20 bg-black/60 text-white hover:bg-black/60">
                                <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                                Analytics
                              </Badge>
                            ) : (
                              <Badge className="border-white/20 bg-black/60 text-white hover:bg-black/60">
                                Database
                              </Badge>
                            )}
                          </div>

                          {item.source === 'youtube' && (
                            <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 p-2 text-white">
                              <PlayCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        {/* DETAILS */}
                        <div className="min-w-0 flex-1 p-5">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
                                  {item.title}
                                </h3>

                                <Badge
                                  variant="outline"
                                  className="border-emerald-200 bg-emerald-50 text-emerald-600"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Published
                                </Badge>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                {item.channelName && (
                                  <>
                                    <span className="font-medium text-slate-600">
                                      {item.channelName}
                                    </span>
                                    <span>•</span>
                                  </>
                                )}

                                <span>
                                  <Calendar className="mr-1 inline h-3 w-3" />
                                  {new Date(
                                    item.publishDate
                                  ).toLocaleDateString()}
                                </span>

                                <span>•</span>

                                <span className="capitalize">
                                  {String(item.format)}
                                </span>
                              </div>
                            </div>

                            {item.source === 'database' && (
                              <div className="flex shrink-0 gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(item)}
                                >
                                  <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                                  Edit
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => askDelete(item)}
                                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6">
                            <Metric
                              icon={<Eye className="h-4 w-4" />}
                              label="Views"
                              value={formatNumber(item.views || 0)}
                            />

                            <Metric
                              icon={<Heart className="h-4 w-4" />}
                              label="Likes"
                              value={formatNumber(item.likes || 0)}
                            />

                            <Metric
                              icon={<MessageSquare className="h-4 w-4" />}
                              label="Comments"
                              value={formatNumber(item.comments || 0)}
                            />

                            {item.source === 'youtube' ? (
                              <>
                                <Metric
                                  icon={<Target className="h-4 w-4" />}
                                  label="CTR"
                                  value={formatPercent(item.ctr || 0)}
                                />

                                <Metric
                                  icon={<Clock3 className="h-4 w-4" />}
                                  label="Watch time"
                                  value={formatHours(
                                    item.watchHours || 0
                                  )}
                                />

                                <Metric
                                  icon={<TrendingUp className="h-4 w-4" />}
                                  label="Retention"
                                  value={formatPercent(
                                    item.retention || 0
                                  )}
                                />
                              </>
                            ) : (
                              <>
                                <Metric
                                  icon={<TrendingUp className="h-4 w-4" />}
                                  label="Engagement"
                                  value={formatPercent(
                                    item.engagementRate || 0
                                  )}
                                />

                                <Metric
                                  icon={<Zap className="h-4 w-4" />}
                                  label="Shares"
                                  value={formatNumber(item.shares || 0)}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Content Entry' : 'Add Content Entry'}
            </DialogTitle>

            <DialogDescription>
              Add content performance data to your CreatorIQ database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Content title
              </label>

              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter content title"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Platform
              </label>

              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="twitter">X / Twitter</SelectItem>
                  <SelectItem value="twitch">Twitch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Format
              </label>

              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Views
              </label>

              <Input
                type="number"
                value={views}
                onChange={(event) => setViews(event.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Likes
              </label>

              <Input
                type="number"
                value={likes}
                onChange={(event) => setLikes(event.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Comments
              </label>

              <Input
                type="number"
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Shares
              </label>

              <Input
                type="number"
                value={shares}
                onChange={(event) => setShares(event.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Publish date
              </label>

              <Input
                type="date"
                value={publishDate}
                onChange={(event) =>
                  setPublishDate(event.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">
                    Scheduled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Thumbnail URL
              </label>

              <Input
                value={thumbnail}
                onChange={(event) => setThumbnail(event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Content URL
              </label>

              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={saveContent}>
              {editingItem ? 'Save Changes' : 'Add Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this content entry?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. The selected database content
              entry will be permanently removed from CreatorIQ.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={deleteContent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
