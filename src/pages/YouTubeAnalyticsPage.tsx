import React, { useEffect, useState } from 'react';
import {
  Youtube,
  Calendar,
  Eye,
  Clock,
  Users,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Video,
  TrendingUp,
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';


const API_URL = 'http://127.0.0.1:8000';


interface YouTubeChannel {
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
}


interface YouTubeVideo {
  title: string;
  views: number;
  watch_hours: number;
  ctr: number;
  duration: string;
  retention: number;
}


interface TrafficSource {
  source: string;
  percentage: number;
}


interface DailyData {
  date: string;
  watch_time_hours: number;
}


export default function YouTubeAnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>('28d');

  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');

  const [overview, setOverview] = useState<YouTubeChannel | null>(null);
  const [topVideos, setTopVideos] = useState<YouTubeVideo[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [watchTimeData, setWatchTimeData] = useState<
    { day: string; hours: number }[]
  >([]);

  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState('');


  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('creatoriq_token')}`,
    'Content-Type': 'application/json',
  });


  // Load the five YouTube channels
  useEffect(() => {
    async function loadChannels() {
      try {
        setLoadingChannels(true);
        setError('');

        const response = await fetch(
          `${API_URL}/youtube/analytics/channels`,
          {
            headers: getHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load channels (${response.status})`);
        }

        const data = await response.json();

        setChannels(data.channels || []);

        if (data.channels?.length > 0) {
          setSelectedChannelId(data.channels[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load YouTube channels.');
      } finally {
        setLoadingChannels(false);
      }
    }

    loadChannels();
  }, []);


  // Load analytics whenever the selected channel changes
  useEffect(() => {
    if (!selectedChannelId) return;

    async function loadAnalytics() {
      try {
        setLoadingAnalytics(true);
        setError('');

        const [
          overviewResponse,
          videosResponse,
          trafficResponse,
          dailyResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/youtube/analytics/overview/${selectedChannelId}`,
            {
              headers: getHeaders(),
            }
          ),

          fetch(
            `${API_URL}/youtube/analytics/videos/${selectedChannelId}`,
            {
              headers: getHeaders(),
            }
          ),

          fetch(
            `${API_URL}/youtube/analytics/traffic/${selectedChannelId}`,
            {
              headers: getHeaders(),
            }
          ),

          fetch(
            `${API_URL}/youtube/analytics/daily/${selectedChannelId}`,
            {
              headers: getHeaders(),
            }
          ),
        ]);


        if (
          !overviewResponse.ok ||
          !videosResponse.ok ||
          !trafficResponse.ok ||
          !dailyResponse.ok
        ) {
          throw new Error('Failed to load YouTube analytics.');
        }


        const overviewData = await overviewResponse.json();
        const videosData = await videosResponse.json();
        const trafficData = await trafficResponse.json();
        const dailyData = await dailyResponse.json();


        setOverview(overviewData);

        setTopVideos(videosData.videos || []);

        setTrafficSources(trafficData.sources || []);

        setWatchTimeData(
          (dailyData.data || []).map((item: DailyData) => ({
            day: new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
            }),
            hours: item.watch_time_hours,
          }))
        );

      } catch (err) {
        console.error(err);
        setError('Unable to load analytics for this channel.');
      } finally {
        setLoadingAnalytics(false);
      }
    }

    loadAnalytics();
  }, [selectedChannelId]);


  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return '—';

    return value.toLocaleString();
  };


  const formatLargeNumber = (value: number | undefined) => {
    if (value === undefined) return '—';

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return value.toLocaleString();
  };


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-500 flex items-center justify-center font-bold">
            <Youtube className="w-7 h-7" />
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                YouTube Channel Analytics
              </h1>

              {overview?.verified_partner && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  Verified Partner
                </Badge>
              )}

            </div>

            <p className="text-sm text-muted-foreground mt-0.5">
              {overview
                ? `${overview.name} (${overview.handle})`
                : 'Loading YouTube channel...'}
            </p>

            {overview && (
              <p className="text-xs text-muted-foreground mt-1">
                Channel ID: {overview.id}
              </p>
            )}

          </div>
        </div>


        <div className="flex items-center gap-2">

          {/* Channel selector */}
          <Select
            value={selectedChannelId}
            onValueChange={setSelectedChannelId}
            disabled={loadingChannels}
          >

            <SelectTrigger className="bg-card w-56 h-9 text-xs">

              <Youtube className="w-3.5 h-3.5 mr-1 text-red-500" />

              <SelectValue placeholder="Select channel" />

            </SelectTrigger>

            <SelectContent className="bg-card">

              {channels.map((channel) => (
                <SelectItem
                  key={channel.id}
                  value={channel.id}
                >
                  {channel.name}
                </SelectItem>
              ))}

            </SelectContent>

          </Select>


          {/* Date selector */}
          <Select
            value={dateRange}
            onValueChange={setDateRange}
          >

            <SelectTrigger className="bg-card w-36 h-9 text-xs">

              <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />

              <SelectValue placeholder="Date Range" />

            </SelectTrigger>

            <SelectContent className="bg-card">

              <SelectItem value="7d">
                Last 7 Days
              </SelectItem>

              <SelectItem value="28d">
                Last 28 Days
              </SelectItem>

              <SelectItem value="90d">
                Last 90 Days
              </SelectItem>

              <SelectItem value="365d">
                Last 365 Days
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

      </div>


      {/* Error */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-5">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </CardContent>
        </Card>
      )}


      {/* Loading */}
      {loadingAnalytics && (
        <div className="text-sm text-muted-foreground">
          Loading channel analytics...
        </div>
      )}


      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


        {/* Subscribers */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Subscribers
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(overview?.subscribers)}
            </div>

            <p className="text-xs text-emerald-500 font-medium mt-1">
              +{formatNumber(overview?.subscriber_change)} this period
            </p>
          </CardContent>
        </Card>


        {/* Views */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              Total Views
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatLargeNumber(overview?.views)}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Channel views
            </p>
          </CardContent>
        </Card>


        {/* Likes */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" />
              Total Likes
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatLargeNumber(overview?.likes)}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Across all content
            </p>
          </CardContent>
        </Card>


        {/* Comments */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5" />
              Comments
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatLargeNumber(overview?.comments)}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Audience interactions
            </p>
          </CardContent>
        </Card>


        {/* Watch Time */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Watch Time
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(overview?.watch_time_hours)} hrs
            </div>

            <p className="text-xs text-emerald-500 font-medium mt-1">
              +{overview?.watch_time_change ?? 0}% vs benchmark
            </p>
          </CardContent>
        </Card>


        {/* CTR */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Impressions CTR
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {overview?.ctr ?? '—'}%
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {formatLargeNumber(overview?.impressions)} impressions
            </p>
          </CardContent>
        </Card>


        {/* Average View Duration */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Avg View Duration
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overview?.avg_view_duration ?? '—'}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              {overview?.retention ?? '—'}% retention rate
            </p>
          </CardContent>
        </Card>


        {/* Videos */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
              <Video className="w-3.5 h-3.5" />
              Total Videos
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(overview?.videos)}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Published videos
            </p>
          </CardContent>
        </Card>

      </div>


      {/* Watch Time Chart */}
      <Card className="bg-card border-border">

        <CardHeader className="pb-2">

          <CardTitle className="text-base font-semibold">
            Watch Time Volume (Hours / Day)
          </CardTitle>

          <CardDescription className="text-xs">
            {overview?.name
              ? `${overview.name} — last 28 days`
              : 'Daily viewer consumption over the past 28 days'}
          </CardDescription>

        </CardHeader>


        <CardContent>

          <div className="w-full min-w-0 h-64">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart
                data={watchTimeData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >

                <defs>

                  <linearGradient
                    id="ytGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#ef4444"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#ef4444"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />


                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />


                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />


                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString()} hours`,
                    'Watch Time',
                  ]}
                />


                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ytGrad)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </CardContent>

      </Card>


      {/* Top Videos + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        {/* Top Videos */}
        <Card className="lg:col-span-2 bg-card border-border">

          <CardHeader className="pb-3">

            <CardTitle className="text-base font-semibold">
              Top Performing YouTube Videos
            </CardTitle>

            <CardDescription className="text-xs">
              Videos for the selected channel
            </CardDescription>

          </CardHeader>


          <CardContent className="space-y-3">

            {topVideos.map((video, index) => (

              <div
                key={`${selectedChannelId}-${index}`}
                className="p-3 rounded-lg border border-border/80 bg-background/50 flex items-center justify-between gap-3"
              >

                <div className="flex items-center gap-3 min-w-0 flex-1">

                  <div className="w-20 h-12 rounded-md border border-border shrink-0 bg-red-500/10 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-red-400" />
                  </div>


                  <div className="min-w-0 flex-1">

                    <h4
                      className="text-xs font-semibold text-foreground truncate"
                      title={video.title}
                    >
                      {video.title}
                    </h4>


                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 flex-wrap">

                      <span>
                        {formatNumber(video.views)} views
                      </span>

                      <span>•</span>

                      <span>
                        {formatNumber(video.watch_hours)} hrs
                      </span>

                      <span>•</span>

                      <span className="text-emerald-500 font-medium">
                        CTR: {video.ctr}%
                      </span>

                    </div>

                  </div>

                </div>


                <div className="text-right shrink-0">

                  <div className="text-xs font-bold text-foreground">
                    {video.duration}
                  </div>

                  <div className="text-[10px] text-muted-foreground">
                    Retention: {video.retention}%
                  </div>

                </div>

              </div>

            ))}


            {!loadingAnalytics && topVideos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No videos found for this channel.
              </p>
            )}

          </CardContent>

        </Card>


        {/* Traffic Sources */}
        <Card className="bg-card border-border">

          <CardHeader className="pb-3">

            <CardTitle className="text-base font-semibold">
              Traffic Acquisition Sources
            </CardTitle>

            <CardDescription className="text-xs">
              How viewers discovered {overview?.name || 'your content'}
            </CardDescription>

          </CardHeader>


          <CardContent className="space-y-3">

            {trafficSources.map((item) => (

              <div
                key={item.source}
                className="space-y-1"
              >

                <div className="flex items-center justify-between text-xs">

                  <span
                    className="text-muted-foreground truncate max-w-[200px]"
                    title={item.source}
                  >
                    {item.source}
                  </span>

                  <span className="font-semibold text-foreground">
                    {item.percentage}%
                  </span>

                </div>


                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">

                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />

                </div>

              </div>

            ))}


            {!loadingAnalytics && trafficSources.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No traffic data available.
              </p>
            )}

          </CardContent>

        </Card>

      </div>

    </div>
  );
}