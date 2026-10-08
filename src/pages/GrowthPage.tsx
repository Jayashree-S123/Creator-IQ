import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  FileVideo,
  Globe2,
  ArrowUpRight,
  Activity,
  RefreshCw,
  AlertCircle,
  Youtube,
  Instagram,
  Twitter,
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

interface GrowthRecord {
  date: string;
  platform: string;
  followers: number;
  views: number;
  engagement: number;
}

interface PlatformData {
  platform: string;
  content: number;
  views: number;
  engagement: number;
}

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return '0';

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toLocaleString();
};

const formatDate = (date: string) => {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getPlatformIcon = (platform: string) => {
  const name = platform.toLowerCase();

  if (name === 'youtube') {
    return <Youtube className="h-5 w-5" />;
  }

  if (name === 'instagram') {
    return <Instagram className="h-5 w-5" />;
  }

  if (name === 'twitter' || name === 'x') {
    return <Twitter className="h-5 w-5" />;
  }

  return <Globe2 className="h-5 w-5" />;
};

const getPlatformName = (platform: string) => {
  const name = platform.toLowerCase();

  if (name === 'youtube') return 'YouTube';
  if (name === 'instagram') return 'Instagram';
  if (name === 'twitter') return 'X / Twitter';
  if (name === 'tiktok') return 'TikTok';
  if (name === 'twitch') return 'Twitch';

  return platform.charAt(0).toUpperCase() + platform.slice(1);
};

export default function GrowthPage() {
  const [timeframe, setTimeframe] = useState('6m');

  const [growthHistory, setGrowthHistory] = useState<GrowthRecord[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const getDays = () => {
    switch (timeframe) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case '6m':
        return 180;
      default:
        return 180;
    }
  };

  const loadGrowthData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const token = localStorage.getItem('creatoriq_token');

      if (!token) {
        setError('Authentication token not found.');
        return;
      }

      const days = getDays();

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      const [historyResponse, platformResponse] = await Promise.all([
        fetch(
          `${API_URL}/growth/history?platform=all&days=${days}`,
          { headers }
        ),
        fetch(
          `${API_URL}/growth/platform`,
          { headers }
        ),
      ]);

      if (!historyResponse.ok) {
        throw new Error('Failed to load growth history');
      }

      if (!platformResponse.ok) {
        throw new Error('Failed to load platform data');
      }

      const historyData = await historyResponse.json();
      const platformResult = await platformResponse.json();

      setGrowthHistory(historyData.history || []);
      setPlatformData(platformResult.platforms || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load growth analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGrowthData();
  }, [timeframe]);

  // --------------------------------------------------
  // REAL DATABASE METRICS
  // --------------------------------------------------

  const latestSnapshot = useMemo(() => {
    if (growthHistory.length === 0) return null;

    return growthHistory[growthHistory.length - 1];
  }, [growthHistory]);

  const previousSnapshot = useMemo(() => {
    if (growthHistory.length < 2) return null;

    return growthHistory[growthHistory.length - 2];
  }, [growthHistory]);

  const currentFollowers = latestSnapshot?.followers || 0;

  const followerChange = useMemo(() => {
    if (!latestSnapshot || !previousSnapshot) {
      return null;
    }

    return latestSnapshot.followers - previousSnapshot.followers;
  }, [latestSnapshot, previousSnapshot]);

  const followerGrowthPercent = useMemo(() => {
    if (
      !latestSnapshot ||
      !previousSnapshot ||
      previousSnapshot.followers === 0
    ) {
      return null;
    }

    return (
      ((latestSnapshot.followers - previousSnapshot.followers) /
        previousSnapshot.followers) *
      100
    );
  }, [latestSnapshot, previousSnapshot]);

  const totalContent = useMemo(
    () =>
      platformData.reduce(
        (sum, platform) => sum + (platform.content || 0),
        0
      ),
    [platformData]
  );

  const totalViews = useMemo(
    () =>
      platformData.reduce(
        (sum, platform) => sum + (platform.views || 0),
        0
      ),
    [platformData]
  );

  const totalEngagement = useMemo(
    () =>
      platformData.reduce(
        (sum, platform) => sum + (platform.engagement || 0),
        0
      ),
    [platformData]
  );

  const engagementRate =
    totalViews > 0
      ? (totalEngagement / totalViews) * 100
      : 0;

  const averageViews =
    totalContent > 0
      ? totalViews / totalContent
      : 0;

  // --------------------------------------------------
  // CHART DATA
  // --------------------------------------------------

  const audienceChartData = useMemo(
    () =>
      growthHistory.map((item) => ({
        date: formatDate(item.date),
        followers: item.followers || 0,
      })),
    [growthHistory]
  );

  const snapshotPerformanceData = useMemo(
    () =>
      growthHistory.map((item) => ({
        date: formatDate(item.date),
        views: item.views || 0,
        engagement: item.engagement || 0,
      })),
    [growthHistory]
  );

  const platformChartData = useMemo(
    () =>
      platformData.map((item) => ({
        platform: getPlatformName(item.platform),
        views: item.views || 0,
        engagement: item.engagement || 0,
        content: item.content || 0,
      })),
    [platformData]
  );

  const bestPlatform = useMemo(() => {
    if (platformData.length === 0) return null;

    return [...platformData].sort(
      (a, b) => b.views - a.views
    )[0];
  }, [platformData]);

  const mostEngagingPlatform = useMemo(() => {
    if (platformData.length === 0) return null;

    return [...platformData].sort(
      (a, b) => b.engagement - a.engagement
    )[0];
  }, [platformData]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">
            Loading growth analytics...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />

            <div>
              <p className="font-semibold text-red-800">
                {error}
              </p>

              <button
                onClick={() => loadGrowthData()}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Growth & Trends
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Track audience growth, content reach, and engagement
            across your platforms.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() => loadGrowthData(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>

          <select
            value={timeframe}
            onChange={(event) =>
              setTimeframe(event.target.value)
            }
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="6m">Last 6 Months</option>
          </select>

        </div>
      </div>

      {/* ==================================================
          KPI CARDS
      ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        {/* Followers */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>

            {followerGrowthPercent !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                  followerGrowthPercent >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <ArrowUpRight className="h-3 w-3" />
                {followerGrowthPercent.toFixed(1)}%
              </span>
            )}

          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Current Followers
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatNumber(currentFollowers)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Latest recorded snapshot
          </p>
        </div>

        {/* Views */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <Eye className="h-5 w-5 text-violet-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Total Content Views
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatNumber(totalViews)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Across recorded content
          </p>

        </div>

        {/* Engagement */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
            <Heart className="h-5 w-5 text-pink-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Total Engagement
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatNumber(totalEngagement)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Likes, comments, shares & saves
          </p>

        </div>

        {/* Content */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <FileVideo className="h-5 w-5 text-amber-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Content Published
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalContent.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Across {platformData.length} platform
            {platformData.length === 1 ? '' : 's'}
          </p>

        </div>

        {/* Engagement Rate */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Engagement / Views
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {engagementRate.toFixed(1)}%
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Recorded engagement divided by views
          </p>

        </div>

      </div>

      {/* ==================================================
          AUDIENCE GROWTH
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />

              <h2 className="text-lg font-bold text-slate-900">
                Audience Growth
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Follower snapshots recorded in CreatorIQ.
            </p>
          </div>

          {growthHistory.length > 0 && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              {growthHistory.length}{' '}
              {growthHistory.length === 1
                ? 'snapshot'
                : 'snapshots'}{' '}
              available
            </div>
          )}

        </div>

        {growthHistory.length < 2 ? (

          <div className="flex min-h-[330px] items-center justify-center p-8">

            <div className="max-w-md text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                <Users className="h-7 w-7 text-blue-600" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Audience history is just getting started
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You currently have {growthHistory.length}{' '}
                recorded audience snapshot
                {growthHistory.length === 1 ? '' : 's'}.
                More snapshots are needed before a meaningful
                growth trend can be displayed.
              </p>

              {latestSnapshot && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Latest recorded audience
                  </p>

                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {currentFollowers.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {getPlatformName(latestSnapshot.platform)}
                    {' · '}
                    {formatDate(latestSnapshot.date)}
                  </p>
                </div>
              )}

            </div>

          </div>

        ) : (

          <div className="h-[380px] p-6">

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={audienceChartData}>

                <defs>
                  <linearGradient
                    id="audienceGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                />

                <Tooltip
                  formatter={(value: number) => [
                    value.toLocaleString(),
                    'Followers',
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#audienceGradient)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </AreaChart>
            </ResponsiveContainer>

          </div>

        )}

      </div>

      {/* ==================================================
          VIEWS + ENGAGEMENT
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Views */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-violet-600" />

              <h2 className="text-lg font-bold text-slate-900">
                Views Trend
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Views recorded in growth snapshots.
            </p>

          </div>

          {snapshotPerformanceData.length === 0 ? (

            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-slate-500">
                No view snapshots available yet.
              </p>
            </div>

          ) : (

            <div className="h-[300px] p-6">

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={snapshotPerformanceData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatNumber}
                  />

                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      'Views',
                    ]}
                  />

                  <Bar
                    dataKey="views"
                    fill="#7c3aed"
                    radius={[5, 5, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          )}

        </div>

        {/* Engagement */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-pink-600" />

              <h2 className="text-lg font-bold text-slate-900">
                Engagement Trend
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Engagement recorded in growth snapshots.
            </p>

          </div>

          {snapshotPerformanceData.length === 0 ? (

            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-slate-500">
                No engagement snapshots available yet.
              </p>
            </div>

          ) : (

            <div className="h-[300px] p-6">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={snapshotPerformanceData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatNumber}
                  />

                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      'Engagement',
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#db2777"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          )}

        </div>

      </div>

      {/* ==================================================
          PLATFORM PERFORMANCE
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-6">

          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-blue-600" />

            <h2 className="text-lg font-bold text-slate-900">
              Platform Performance
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Performance calculated from your recorded CreatorIQ
            content.
          </p>

        </div>

        {platformData.length === 0 ? (

          <div className="flex min-h-[260px] items-center justify-center">
            <p className="text-sm text-slate-500">
              No platform content data available.
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">

            {platformData.map((platform) => {

              const platformRate =
                platform.views > 0
                  ? (platform.engagement /
                      platform.views) *
                    100
                  : 0;

              return (
                <div
                  key={platform.platform}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-slate-300 hover:bg-white"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                        {getPlatformIcon(platform.platform)}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {getPlatformName(platform.platform)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {platform.content}{' '}
                          {platform.content === 1
                            ? 'content item'
                            : 'content items'}
                        </p>
                      </div>

                    </div>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {platformRate.toFixed(1)}%
                    </span>

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs text-slate-500">
                        Views
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatNumber(platform.views)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Engagement
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatNumber(platform.engagement)}
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          platformRate,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Engagement / views
                  </p>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* ==================================================
          PLATFORM COMPARISON CHART
      ================================================== */}

      {platformChartData.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 p-6">

            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />

              <h2 className="text-lg font-bold text-slate-900">
                Platform Comparison
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Compare views and engagement across your recorded
              platforms.
            </p>

          </div>

          <div className="h-[340px] p-6">

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformChartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="platform"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="views"
                  name="Views"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="engagement"
                  name="Engagement"
                  fill="#db2777"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>
      )}

      {/* ==================================================
          GROWTH INSIGHTS
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-6">

          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />

            <h2 className="text-lg font-bold text-slate-900">
              Growth Insights
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Highlights calculated from the data currently
            available in CreatorIQ.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">

          {/* Best views */}

          <div className="rounded-xl border border-slate-200 p-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-900">
              Top View Platform
            </p>

            {bestPlatform ? (
              <>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {getPlatformName(bestPlatform.platform)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatNumber(bestPlatform.views)} recorded
                  views
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                No platform data yet.
              </p>
            )}

          </div>

          {/* Best engagement */}

          <div className="rounded-xl border border-slate-200 p-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-900">
              Top Engagement Platform
            </p>

            {mostEngagingPlatform ? (
              <>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {getPlatformName(
                    mostEngagingPlatform.platform
                  )}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatNumber(
                    mostEngagingPlatform.engagement
                  )}{' '}
                  recorded engagements
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                No platform data yet.
              </p>
            )}

          </div>

          {/* Average views */}

          <div className="rounded-xl border border-slate-200 p-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
              <FileVideo className="h-5 w-5 text-violet-600" />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-900">
              Average Views / Content
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatNumber(averageViews)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Based on recorded content
            </p>

          </div>

        </div>

      </div>

      {/* ==================================================
          DATA STATUS
      ================================================== */}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

        <div className="flex items-start gap-3">

          <Activity className="mt-0.5 h-5 w-5 text-blue-600" />

          <div>

            <p className="text-sm font-semibold text-slate-900">
              Data sources
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Audience history comes from recorded CreatorIQ
              PostgreSQL growth snapshots. Platform content
              performance comes from your CreatorIQ content
              records.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Historical audience trends will become more
              detailed as additional real snapshots are
              recorded.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}