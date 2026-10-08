import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Video,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Youtube,
  Clock,
  MousePointerClick
} from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import type {
  ContentItem,
  PlatformType,
  ContentFormat
} from '@/types/creator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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

const API_URL = 'http://127.0.0.1:8000';

type BackendContent = {
  id: number;
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watch_time: number;
  reach: number;
  engagement_rate: number;
};

type ContentSummary = {
  total_content: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  total_reach: number;
  engagement_rate: number;
};

type TopContent = {
  id: number;
  title: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
};

type YouTubeChannel = {
  id: string;
  name: string;
  handle: string;
  description: string;
  subscribers: number;
  subscriber_change: number;
  views: number;
  likes: number;
  comments: number;
  watch_time_hours: number;
  watch_time_change: number;
  impressions: number;
  ctr: number;
  avg_view_duration: string;
  retention: number;
  videos: number;
  verified_partner: boolean;
};

type YouTubeVideo = {
  title: string;
  views: number;
  watch_hours: number;
  ctr: number;
  duration: string;
  retention: number;
  channelId: string;
  channelName: string;
};

type DisplayContent = ContentItem & {
  source: 'database' | 'youtube';
  channelName?: string;
  watchHours?: number;
  ctr?: number;
  retention?: number;
};

function mapPlatform(platform: string): PlatformType {
  const value = platform.toLowerCase();

  if (value === 'instagram') return 'instagram';
  if (value === 'tiktok') return 'tiktok';
  if (value === 'twitter' || value === 'x') return 'twitter';
  if (value === 'twitch') return 'twitch';

  return 'youtube';
}

function mapBackendContent(item: BackendContent): DisplayContent {
  return {
    id: String(item.id),
    title: item.title,
    platform: mapPlatform(item.platform),
    format: 'video',
    views: item.views,
    likes: item.likes,
    comments: item.comments,
    shares: item.shares,
    engagementRate: item.engagement_rate,
    publishDate: new Date().toISOString().split('T')[0],
    thumbnail:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    url: '#',
    status: 'published',
    source: 'database'
  };
}

function mapYouTubeVideo(video: YouTubeVideo): DisplayContent {
  return {
    id: `youtube-${video.channelId}-${video.title}`,
    title: video.title,
    platform: 'youtube',
    format: 'video',
    views: video.views,
    likes: 0,
    comments: 0,
    shares: 0,
    engagementRate: video.ctr,
    publishDate: 'YouTube Analytics',
    thumbnail:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
    url: '#',
    status: 'published',
    source: 'youtube',
    channelName: video.channelName,
    watchHours: video.watch_hours,
    ctr: video.ctr,
    retention: video.retention
  };
}

export default function ContentPage() {
  const { state } = useCreatorAuth();

  const [backendContent, setBackendContent] =
    useState<DisplayContent[]>([]);

  const [youtubeContent, setYoutubeContent] =
    useState<DisplayContent[]>([]);

  const [youtubeChannels, setYoutubeChannels] =
    useState<YouTubeChannel[]>([]);

  const [youtubeLoading, setYoutubeLoading] =
    useState(false);

  const [loadingContent, setLoadingContent] =
    useState(true);

  const [dataSource, setDataSource] =
    useState<'youtube' | 'database' | 'all'>('youtube');

  const [selectedChannel, setSelectedChannel] =
    useState('all');

  const [summary, setSummary] =
    useState<ContentSummary>({
      total_content: 0,
      total_views: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      total_saves: 0,
      total_reach: 0,
      engagement_rate: 0
    });

  const [chartData, setChartData] = useState<
    {
      name: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
    }[]
  >([]);

  const [topContent, setTopContent] =
    useState<TopContent[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] =
    useState<string>('all');
  const [formatFilter, setFormatFilter] =
    useState<string>('all');
  const [statusFilter, setStatusFilter] =
    useState<string>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ContentItem | null>(null);

  const [title, setTitle] = useState('');
  const [platform, setPlatform] =
    useState<PlatformType>('youtube');
  const [format, setFormat] =
    useState<ContentFormat>('video');
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<
    'published' | 'scheduled' | 'draft'
  >('published');

  const [deleteConfirmOpen, setDeleteConfirmOpen] =
    useState(false);

  const [itemToDelete, setItemToDelete] =
    useState<ContentItem | null>(null);

  const getToken = () => {
    return localStorage.getItem('creatoriq_token');
  };

  // --------------------------------------------------
  // FETCH DATABASE CONTENT
  // --------------------------------------------------

  const fetchContent = async () => {
    try {
      const token = getToken();

      if (!token) {
        toast.error('Please log in again.');
        return;
      }

      const response = await fetch(
        `${API_URL}/content/`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load content'
        );
      }

      const mappedContent = (
        data.content || []
      ).map(
        (item: BackendContent) =>
          mapBackendContent(item)
      );

      setBackendContent(mappedContent);
    } catch (error) {
      console.error(
        'Content fetch error:',
        error
      );

      toast.error(
        'Could not load database content'
      );
    }
  };

  // --------------------------------------------------
  // FETCH CONTENT SUMMARY
  // --------------------------------------------------

  const fetchSummary = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/content/summary`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Failed to load content summary'
        );
      }

      setSummary(data);
    } catch (error) {
      console.error(
        'Summary fetch error:',
        error
      );
    }
  };

  // --------------------------------------------------
  // FETCH TOP DATABASE CONTENT
  // --------------------------------------------------

  const fetchTopContent = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/content/top`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Failed to load top content'
        );
      }

      setTopContent(
        data.top_content || []
      );
    } catch (error) {
      console.error(
        'Top content fetch error:',
        error
      );
    }
  };

  // --------------------------------------------------
  // FETCH YOUTUBE ANALYTICS DATA
  // --------------------------------------------------

  const fetchYouTubeContent = async () => {
    setYoutubeLoading(true);

    try {
      const token = getToken();

      if (!token) {
        toast.error('Please log in again.');
        return;
      }

      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      };

      const channelsResponse = await fetch(
        `${API_URL}/youtube/analytics/channels`,
        { headers }
      );

      const channelsData =
        await channelsResponse.json();

      if (!channelsResponse.ok) {
        throw new Error(
          channelsData.detail ||
            'Failed to load YouTube channels'
        );
      }

      const channels: YouTubeChannel[] =
        channelsData.channels || [];

      setYoutubeChannels(channels);

      // Load videos for all five channels.
      const videoResults =
        await Promise.all(
          channels.map(async channel => {
            const response = await fetch(
              `${API_URL}/youtube/analytics/videos/${channel.id}`,
              { headers }
            );

            const data =
              await response.json();

            if (!response.ok) {
              throw new Error(
                data.detail ||
                  `Failed to load videos for ${channel.name}`
              );
            }

            return {
              channel,
              videos: data.videos || []
            };
          })
        );

      const allVideos: DisplayContent[] = [];

      videoResults.forEach(
        ({ channel, videos }) => {
          videos.forEach(
            (video: Omit<
              YouTubeVideo,
              'channelId' | 'channelName'
            >) => {
              allVideos.push(
                mapYouTubeVideo({
                  ...video,
                  channelId: channel.id,
                  channelName: channel.name
                })
              );
            }
          );
        }
      );

      setYoutubeContent(allVideos);

      if (allVideos.length === 0) {
        toast.info(
          'No YouTube video analytics found.'
        );
      }
    } catch (error) {
      console.error(
        'YouTube content fetch error:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not load YouTube Analytics content'
      );
    } finally {
      setYoutubeLoading(false);
      setLoadingContent(false);
    }
  };

  // --------------------------------------------------
  // INITIAL PAGE LOAD
  // --------------------------------------------------

  useEffect(() => {
    const loadPage = async () => {
      setLoadingContent(true);

      await Promise.all([
        fetchContent(),
        fetchSummary(),
        fetchTopContent(),
        fetchYouTubeContent()
      ]);
    };

    loadPage();
  }, []);

  // --------------------------------------------------
  // SELECT DATA SOURCE
  // --------------------------------------------------

  const displayedSourceContent = useMemo(() => {
    if (dataSource === 'database') {
      return backendContent;
    }

    if (dataSource === 'youtube') {
      return youtubeContent;
    }

    return [
      ...backendContent,
      ...youtubeContent
    ];
  }, [
    dataSource,
    backendContent,
    youtubeContent
  ]);

  // --------------------------------------------------
  // FILTER BY YOUTUBE CHANNEL
  // --------------------------------------------------

  const channelFilteredContent = useMemo(() => {
    if (selectedChannel === 'all') {
      return displayedSourceContent;
    }

    return displayedSourceContent.filter(
      item =>
        item.channelName === selectedChannel
    );
  }, [
    displayedSourceContent,
    selectedChannel
  ]);

  // --------------------------------------------------
  // FILTER CONTENT
  // --------------------------------------------------

  const filteredItems = useMemo(() => {
    return channelFilteredContent.filter(
      (item: DisplayContent) => {
        if (
          searchTerm.trim() &&
          !item.title
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        ) {
          return false;
        }

        if (
          platformFilter !== 'all' &&
          item.platform !== platformFilter
        ) {
          return false;
        }

        if (
          formatFilter !== 'all' &&
          item.format !== formatFilter
        ) {
          return false;
        }

        if (
          statusFilter !== 'all' &&
          item.status !== statusFilter
        ) {
          return false;
        }

        return true;
      }
    );
  }, [
    channelFilteredContent,
    searchTerm,
    platformFilter,
    formatFilter,
    statusFilter
  ]);

  // --------------------------------------------------
  // CALCULATE DISPLAY SUMMARY
  // --------------------------------------------------

  const displaySummary = useMemo(() => {
    if (dataSource === 'database') {
      return summary;
    }

    const items = channelFilteredContent;

    const totalViews = items.reduce(
      (sum, item) =>
        sum + (item.views || 0),
      0
    );

    const totalLikes = items.reduce(
      (sum, item) =>
        sum + (item.likes || 0),
      0
    );

    const totalComments = items.reduce(
      (sum, item) =>
        sum + (item.comments || 0),
      0
    );

    const totalShares = items.reduce(
      (sum, item) =>
        sum + (item.shares || 0),
      0
    );

    const totalReach = totalViews;

    const averageCTR =
      items.length > 0
        ? items.reduce(
            (sum, item) =>
              sum + (item.ctr || 0),
            0
          ) / items.length
        : 0;

    return {
      total_content: items.length,
      total_views: totalViews,
      total_likes: totalLikes,
      total_comments: totalComments,
      total_shares: totalShares,
      total_saves: 0,
      total_reach: totalReach,
      engagement_rate:
        Number(averageCTR.toFixed(2))
    };
  }, [
    dataSource,
    summary,
    channelFilteredContent
  ]);

  // --------------------------------------------------
  // CALCULATE CHART DATA
  // --------------------------------------------------

  useEffect(() => {
    const data = filteredItems.map(
      item => ({
        name:
          item.title.length > 18
            ? item.title.substring(0, 18) + '...'
            : item.title,
        views: item.views || 0,
        likes: item.likes || 0,
        comments: item.comments || 0,
        shares: item.shares || 0
      })
    );

    setChartData(data);
  }, [filteredItems]);

  // --------------------------------------------------
  // CALCULATE TOP CONTENT
  // --------------------------------------------------

  const displayTopContent = useMemo(() => {
    if (
      dataSource === 'database' &&
      selectedChannel === 'all'
    ) {
      return topContent;
    }

    return [...filteredItems]
      .sort(
        (a, b) =>
          (b.views || 0) -
          (a.views || 0)
      )
      .slice(0, 5)
      .map((item, index) => ({
        id: index + 1,
        title: item.title,
        platform: item.platform,
        views: item.views || 0,
        likes: item.likes || 0,
        comments: item.comments || 0,
        shares: item.shares || 0,
        engagement_rate:
          item.engagementRate || 0
      }));
  }, [
    dataSource,
    selectedChannel,
    topContent,
    filteredItems
  ]);

  // --------------------------------------------------
  // ADD CONTENT
  // --------------------------------------------------

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setPlatform('youtube');
    setFormat('video');
    setViews('');
    setLikes('');
    setComments('');
    setShares('');

    setPublishDate(
      new Date()
        .toISOString()
        .split('T')[0]
    );

    setThumbnail(
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    );

    setUrl('');
    setStatus('published');
    setModalOpen(true);
  };

  // --------------------------------------------------
  // EDIT CONTENT
  // --------------------------------------------------

  const handleOpenEdit = (
    item: ContentItem
  ) => {
    if (
      (item as DisplayContent).source ===
      'youtube'
    ) {
      toast.info(
        'YouTube Analytics content is read-only. Use Add Content Entry for a custom database entry.'
      );
      return;
    }

    setEditingItem(item);
    setTitle(item.title);
    setPlatform(item.platform);
    setFormat(item.format);
    setViews(item.views.toString());
    setLikes(item.likes.toString());
    setComments(
      item.comments.toString()
    );
    setShares(item.shares.toString());
    setPublishDate(item.publishDate);
    setThumbnail(item.thumbnail);
    setUrl(item.url);
    setStatus(item.status);
    setModalOpen(true);
  };

  // --------------------------------------------------
  // SAVE CONTENT
  // --------------------------------------------------

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(
        'Please enter a content title'
      );
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        toast.error('Please log in again.');
        return;
      }

      const vNum = parseInt(views) || 0;
      const lNum = parseInt(likes) || 0;
      const cNum = parseInt(comments) || 0;
      const sNum = parseInt(shares) || 0;

      const params =
        new URLSearchParams();

      params.append(
        'title',
        title.trim()
      );

      params.append(
        'platform',
        platform
      );

      params.append(
        'views',
        String(vNum)
      );

      params.append(
        'likes',
        String(lNum)
      );

      params.append(
        'comments',
        String(cNum)
      );

      params.append(
        'shares',
        String(sNum)
      );

      params.append(
        'saves',
        '0'
      );

      params.append(
        'watch_time',
        '0'
      );

      params.append(
        'reach',
        String(vNum)
      );

      const requestUrl = editingItem
        ? `${API_URL}/content/${editingItem.id}?${params.toString()}`
        : `${API_URL}/content/?${params.toString()}`;

      const response = await fetch(
        requestUrl,
        {
          method: editingItem
            ? 'PUT'
            : 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Failed to save content'
        );
      }

      toast.success(
        editingItem
          ? 'Content updated successfully'
          : 'New content added successfully'
      );

      setModalOpen(false);
      setEditingItem(null);

      await fetchContent();
      await fetchSummary();
      await fetchTopContent();
    } catch (error) {
      console.error(
        'Content save error:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not save content'
      );
    }
  };

  // --------------------------------------------------
  // DELETE CONTENT
  // --------------------------------------------------

  const handleConfirmDelete =
    async () => {
      if (!itemToDelete) return;

      if (
        (itemToDelete as DisplayContent)
          .source === 'youtube'
      ) {
        toast.info(
          'YouTube Analytics content cannot be deleted from the Content page.'
        );
        setItemToDelete(null);
        setDeleteConfirmOpen(false);
        return;
      }

      try {
        const token = getToken();

        if (!token) {
          toast.error(
            'Please log in again.'
          );
          return;
        }

        const response =
          await fetch(
            `${API_URL}/content/${itemToDelete.id}`,
            {
              method: 'DELETE',
              headers: {
                Accept:
                  'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              'Failed to delete content'
          );
        }

        toast.success(
          'Content deleted successfully'
        );

        setItemToDelete(null);
        setDeleteConfirmOpen(false);

        await fetchContent();
        await fetchSummary();
        await fetchTopContent();
      } catch (error) {
        console.error(
          'Content delete error:',
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : 'Could not delete content'
        );
      }
    };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Content Analytics
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Track engagement, retention, and performance across your content and YouTube Analytics.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Content Entry</span>
        </Button>
      </div>

      {/* DATA SOURCE */}

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />

                <h2 className="text-sm font-semibold text-foreground">
                  Analytics Data Source
                </h2>

                {dataSource === 'youtube' && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-primary/30 text-primary"
                  >
                    YouTube Analytics
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                Use your existing YouTube Analytics channels and video performance data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <Select
                value={dataSource}
                onValueChange={value =>
                  setDataSource(
                    value as
                      | 'youtube'
                      | 'database'
                      | 'all'
                  )
                }
              >
                <SelectTrigger className="bg-background h-9 text-xs w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="bg-card">
                  <SelectItem value="youtube">
                    YouTube Analytics
                  </SelectItem>

                  <SelectItem value="database">
                    Database Content
                  </SelectItem>

                  <SelectItem value="all">
                    All Content
                  </SelectItem>
                </SelectContent>
              </Select>

              {dataSource !== 'database' &&
                youtubeChannels.length > 0 && (
                  <Select
                    value={selectedChannel}
                    onValueChange={
                      setSelectedChannel
                    }
                  >
                    <SelectTrigger className="bg-background h-9 text-xs w-full sm:w-[230px]">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="bg-card">
                      <SelectItem value="all">
                        All 5 YouTube Channels
                      </SelectItem>

                      {youtubeChannels.map(
                        channel => (
                          <SelectItem
                            key={channel.id}
                            value={channel.name}
                          >
                            {channel.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}

            </div>
          </div>
        </CardContent>
      </Card>

      {/* LOADING */}

      {youtubeLoading && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />

              <p className="text-sm text-muted-foreground">
                Loading YouTube Analytics content from all 5 channels...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Total Content
            </p>

            <p className="text-2xl font-bold text-foreground mt-1">
              {displaySummary.total_content}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Total Views
            </p>

            <p className="text-2xl font-bold text-foreground mt-1">
              {displaySummary.total_views.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Total Likes
            </p>

            <p className="text-2xl font-bold text-foreground mt-1">
              {displaySummary.total_likes.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Comments
            </p>

            <p className="text-2xl font-bold text-foreground mt-1">
              {displaySummary.total_comments.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Reach
            </p>

            <p className="text-2xl font-bold text-foreground mt-1">
              {displaySummary.total_reach.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Avg. CTR
            </p>

            <p className="text-2xl font-bold text-emerald-500 mt-1">
              {displaySummary.engagement_rate}%
            </p>
          </CardContent>
        </Card>

      </div>

      {/* YOUTUBE CHANNEL SUMMARY */}

      {dataSource !== 'database' &&
        selectedChannel === 'all' &&
        youtubeChannels.length > 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-5">

              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  YouTube Channels
                </h2>

                <p className="text-xs text-muted-foreground mt-1">
                  Existing channels available in your YouTube Analytics dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">

                {youtubeChannels.map(
                  channel => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() =>
                        setSelectedChannel(
                          channel.name
                        )
                      }
                      className="text-left p-3 rounded-lg border border-border bg-muted/20 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {channel.name}
                        </span>

                        {channel.verified_partner && (
                          <Badge className="text-[8px] px-1 py-0 h-4">
                            Verified
                          </Badge>
                        )}
                      </div>

                      <p className="text-[10px] text-muted-foreground mt-1">
                        {channel.handle}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3">

                        <div>
                          <p className="text-[9px] text-muted-foreground">
                            Views
                          </p>

                          <p className="text-xs font-bold text-foreground">
                            {channel.views.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] text-muted-foreground">
                            Videos
                          </p>

                          <p className="text-xs font-bold text-foreground">
                            {channel.videos}
                          </p>
                        </div>

                      </div>
                    </button>
                  )
                )}

              </div>
            </CardContent>
          </Card>
        )}

      {/* CONTENT PERFORMANCE CHART */}

      <Card className="bg-card border-border">
        <CardContent className="p-5">

          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Content Performance
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Compare views, likes, comments, and shares across your content.
            </p>
          </div>

          <div className="w-full h-[360px]">

            {chartData.length === 0 ? (

              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No content data available for the chart.
                </p>
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11
                    }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11
                    }}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="views"
                    name="Views"
                    fill="hsl(var(--primary))"
                    radius={[
                      4,
                      4,
                      0,
                      0
                    ]}
                  />

                  <Bar
                    dataKey="likes"
                    name="Likes"
                    fill="hsl(var(--chart-2))"
                    radius={[
                      4,
                      4,
                      0,
                      0
                    ]}
                  />

                  <Bar
                    dataKey="comments"
                    name="Comments"
                    fill="hsl(var(--chart-3))"
                    radius={[
                      4,
                      4,
                      0,
                      0
                    ]}
                  />

                  <Bar
                    dataKey="shares"
                    name="Shares"
                    fill="hsl(var(--chart-4))"
                    radius={[
                      4,
                      4,
                      0,
                      0
                    ]}
                  />

                </BarChart>
              </ResponsiveContainer>

            )}

          </div>

        </CardContent>
      </Card>

      {/* SEARCH AND FILTERS */}

      <Card className="bg-card border-border">
        <CardContent className="p-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            <div className="relative">

              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />

              <Input
                placeholder="Search by title..."
                value={searchTerm}
                onChange={e =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="pl-9 h-9 text-xs"
              />

            </div>

            <Select
              value={platformFilter}
              onValueChange={
                setPlatformFilter
              }
            >
              <SelectTrigger className="bg-background h-9 text-xs">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>

              <SelectContent className="bg-card">

                <SelectItem value="all">
                  All Platforms
                </SelectItem>

                <SelectItem value="youtube">
                  YouTube
                </SelectItem>

                <SelectItem value="instagram">
                  Instagram
                </SelectItem>

                <SelectItem value="tiktok">
                  TikTok
                </SelectItem>

                <SelectItem value="twitter">
                  Twitter / X
                </SelectItem>

                <SelectItem value="twitch">
                  Twitch
                </SelectItem>

              </SelectContent>
            </Select>

            <Select
              value={formatFilter}
              onValueChange={
                setFormatFilter
              }
            >
              <SelectTrigger className="bg-background h-9 text-xs">
                <SelectValue placeholder="All Formats" />
              </SelectTrigger>

              <SelectContent className="bg-card">

                <SelectItem value="all">
                  All Formats
                </SelectItem>

                <SelectItem value="video">
                  Long-form Video
                </SelectItem>

                <SelectItem value="short">
                  Shorts / Reels
                </SelectItem>

                <SelectItem value="post">
                  Text / Carousel Post
                </SelectItem>

                <SelectItem value="stream">
                  Live Stream
                </SelectItem>

              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={
                setStatusFilter
              }
            >
              <SelectTrigger className="bg-background h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>

              <SelectContent className="bg-card">

                <SelectItem value="all">
                  All Statuses
                </SelectItem>

                <SelectItem value="published">
                  Published
                </SelectItem>

                <SelectItem value="scheduled">
                  Scheduled
                </SelectItem>

                <SelectItem value="draft">
                  Draft
                </SelectItem>

              </SelectContent>
            </Select>

          </div>

        </CardContent>
      </Card>

      {/* CONTENT LIST */}

      {loadingContent || youtubeLoading ? (

        <Card className="bg-card border-border p-12 text-center">

          <p className="text-sm text-muted-foreground">
            Loading content analytics...
          </p>

        </Card>

      ) : filteredItems.length === 0 ? (

        <Card className="bg-card border-border p-12 text-center">

          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground mb-3">
            <Video className="w-6 h-6" />
          </div>

          <h3 className="text-base font-semibold text-foreground">
            No content found
          </h3>

          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or add your first content piece to begin tracking metrics.
          </p>

          <Button
            onClick={handleOpenAdd}
            variant="outline"
            className="mt-4 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Content Entry
          </Button>

        </Card>

      ) : (

        <div className="space-y-3">

          {filteredItems.map(
            (item: DisplayContent) => (

              <Card
                key={item.id}
                className="bg-card border-border hover:border-primary/40 transition-colors"
              >

                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

                  <div className="flex items-start gap-3.5 min-w-0 flex-1">

                    <div className="relative shrink-0">

                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-24 h-16 object-cover rounded-lg border border-border"
                      />

                      <Badge className="absolute bottom-1 right-1 text-[9px] uppercase px-1 py-0 h-4 bg-black/80 text-white">
                        {item.format}
                      </Badge>

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2 flex-wrap">

                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          {item.platform}
                        </span>

                        {item.channelName && (
                          <>
                            <span className="text-muted-foreground text-xs">
                              •
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {item.channelName}
                            </span>
                          </>
                        )}

                        <span className="text-muted-foreground text-xs">
                          •
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {item.publishDate}
                        </span>

                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize h-4 px-1.5 border-border"
                        >
                          {item.source ===
                          'youtube'
                            ? 'Analytics'
                            : item.status}
                        </Badge>

                      </div>

                      <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
                        {item.title}
                      </h3>

                      {item.source ===
                        'youtube' &&
                        item.retention !==
                          undefined && (
                          <div className="flex items-center gap-3 mt-2">

                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.watchHours?.toLocaleString() || 0}
                              h watch time
                            </span>

                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <MousePointerClick className="w-3 h-3" />
                              {item.ctr}%
                              CTR
                            </span>

                            <span className="text-[10px] text-muted-foreground">
                              {item.retention}%
                              retention
                            </span>

                          </div>
                        )}

                    </div>

                  </div>

                  <div className="grid grid-cols-4 gap-4 px-2 py-1 bg-muted/20 rounded-lg shrink-0 text-center">

                    <div>

                      <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Views</span>
                      </div>

                      <div className="text-xs font-bold text-foreground mt-0.5">
                        {item.views.toLocaleString()}
                      </div>

                    </div>

                    <div>

                      <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>Likes</span>
                      </div>

                      <div className="text-xs font-bold text-foreground mt-0.5">
                        {item.source ===
                        'youtube'
                          ? '—'
                          : item.likes.toLocaleString()}
                      </div>

                    </div>

                    <div>

                      <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Comments</span>
                      </div>

                      <div className="text-xs font-bold text-foreground mt-0.5">
                        {item.source ===
                        'youtube'
                          ? '—'
                          : item.comments.toLocaleString()}
                      </div>

                    </div>

                    <div>

                      <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>CTR</span>
                      </div>

                      <div className="text-xs font-bold text-emerald-500 mt-0.5">
                        {item.source ===
                        'youtube'
                          ? `${item.ctr ?? 0}%`
                          : `${item.engagementRate}%`}
                      </div>

                    </div>

                  </div>

                  <div className="flex items-center justify-end gap-1.5 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-border">

                    {item.url &&
                      item.url !== '#' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Open post URL"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}

                    {item.source ===
                      'database' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            handleOpenEdit(
                              item
                            )
                          }
                          title="Edit content"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setItemToDelete(
                              item
                            );
                            setDeleteConfirmOpen(
                              true
                            );
                          }}
                          title="Delete content"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                  </div>

                </CardContent>

              </Card>

            )
          )}

        </div>

      )}

      {/* TOP PERFORMING CONTENT */}

      <Card className="bg-card border-border">

        <CardContent className="p-5">

          <div className="mb-4">

            <h2 className="text-base font-semibold text-foreground">
              Top Performing Content
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Top 5 content pieces ranked by views.
            </p>

          </div>

          {displayTopContent.length === 0 ? (

            <div className="py-8 text-center">

              <p className="text-sm text-muted-foreground">
                No top content available.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {displayTopContent.map(
                (item, index) => (

                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border"
                  >

                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">

                      <span className="text-sm font-bold text-primary">
                        {index + 1}
                      </span>

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2">

                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {item.platform}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          •
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {item.engagement_rate.toFixed(
                            2
                          )}
                          % CTR
                        </span>

                      </div>

                      <h3 className="text-sm font-semibold text-foreground mt-1 truncate">
                        {item.title}
                      </h3>

                    </div>

                    <div className="text-right shrink-0">

                      <p className="text-sm font-bold text-foreground">
                        {item.views.toLocaleString()}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        views
                      </p>

                    </div>

                    <div className="hidden sm:block text-right shrink-0 min-w-[70px]">

                      <p className="text-sm font-semibold text-foreground">
                        {item.likes === 0
                          ? '—'
                          : item.likes.toLocaleString()}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        likes
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </CardContent>

      </Card>

      {/* ADD / EDIT DIALOG */}

      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
      >

        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card">

          <DialogHeader>

            <DialogTitle>
              {editingItem
                ? 'Edit Content Details'
                : 'Add New Content Entry'}
            </DialogTitle>

            <DialogDescription>
              Record views, likes, and engagement metrics for analytics tracking.
            </DialogDescription>

          </DialogHeader>

          <form
            onSubmit={handleSave}
            className="space-y-4 py-2"
          >

            <div className="space-y-1.5">

              <Label
                htmlFor="title"
                className="text-xs"
              >
                Content Title *
              </Label>

              <Input
                id="title"
                required
                placeholder="e.g. 10 Secret AI Tools for Developers"
                value={title}
                onChange={e =>
                  setTitle(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="grid grid-cols-2 gap-3">

              <div className="space-y-1.5">

                <Label
                  htmlFor="platform"
                  className="text-xs"
                >
                  Platform
                </Label>

                <Select
                  value={platform}
                  onValueChange={(
                    v: PlatformType
                  ) =>
                    setPlatform(v)
                  }
                >

                  <SelectTrigger
                    id="platform"
                    className="bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-card">

                    <SelectItem value="youtube">
                      YouTube
                    </SelectItem>

                    <SelectItem value="instagram">
                      Instagram
                    </SelectItem>

                    <SelectItem value="tiktok">
                      TikTok
                    </SelectItem>

                    <SelectItem value="twitter">
                      Twitter / X
                    </SelectItem>

                    <SelectItem value="twitch">
                      Twitch
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div className="space-y-1.5">

                <Label
                  htmlFor="format"
                  className="text-xs"
                >
                  Format
                </Label>

                <Select
                  value={format}
                  onValueChange={(
                    v: ContentFormat
                  ) =>
                    setFormat(v)
                  }
                >

                  <SelectTrigger
                    id="format"
                    className="bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-card">

                    <SelectItem value="video">
                      Long-form Video
                    </SelectItem>

                    <SelectItem value="short">
                      Shorts / Reel
                    </SelectItem>

                    <SelectItem value="post">
                      Post
                    </SelectItem>

                    <SelectItem value="stream">
                      Live Stream
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </div>

            <div className="grid grid-cols-3 gap-3">

              <div className="space-y-1.5">

                <Label
                  htmlFor="views"
                  className="text-xs"
                >
                  Views
                </Label>

                <Input
                  id="views"
                  type="number"
                  value={views}
                  onChange={e =>
                    setViews(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-1.5">

                <Label
                  htmlFor="likes"
                  className="text-xs"
                >
                  Likes
                </Label>

                <Input
                  id="likes"
                  type="number"
                  value={likes}
                  onChange={e =>
                    setLikes(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-1.5">

                <Label
                  htmlFor="comments"
                  className="text-xs"
                >
                  Comments
                </Label>

                <Input
                  id="comments"
                  type="number"
                  value={comments}
                  onChange={e =>
                    setComments(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="space-y-1.5">

              <Label
                htmlFor="shares"
                className="text-xs"
              >
                Shares
              </Label>

              <Input
                id="shares"
                type="number"
                value={shares}
                onChange={e =>
                  setShares(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="grid grid-cols-2 gap-3">

              <div className="space-y-1.5">

                <Label
                  htmlFor="publishDate"
                  className="text-xs"
                >
                  Publish Date
                </Label>

                <Input
                  id="publishDate"
                  type="date"
                  value={publishDate}
                  onChange={e =>
                    setPublishDate(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-1.5">

                <Label
                  htmlFor="status"
                  className="text-xs"
                >
                  Status
                </Label>

                <Select
                  value={status}
                  onValueChange={(
                    v:
                      | 'published'
                      | 'scheduled'
                      | 'draft'
                  ) =>
                    setStatus(v)
                  }
                >

                  <SelectTrigger
                    id="status"
                    className="bg-background"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-card">

                    <SelectItem value="published">
                      Published
                    </SelectItem>

                    <SelectItem value="scheduled">
                      Scheduled
                    </SelectItem>

                    <SelectItem value="draft">
                      Draft
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </div>

            <div className="space-y-1.5">

              <Label
                htmlFor="thumbnail"
                className="text-xs"
              >
                Thumbnail Image URL
              </Label>

              <Input
                id="thumbnail"
                placeholder="https://..."
                value={thumbnail}
                onChange={e =>
                  setThumbnail(
                    e.target.value
                  )
                }
              />

            </div>

            <DialogFooter className="pt-2">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setModalOpen(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editingItem
                  ? 'Save Changes'
                  : 'Create Entry'}
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

      {/* DELETE CONFIRMATION */}

      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={
          setDeleteConfirmOpen
        }
      >

        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">

          <AlertDialogHeader>

            <AlertDialogTitle>
              Delete this content entry?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to remove "
              {itemToDelete?.title}" from your analytics tracking?
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              onClick={() =>
                setItemToDelete(null)
              }
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={
                handleConfirmDelete
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
}