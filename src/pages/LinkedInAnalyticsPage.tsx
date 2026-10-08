import { useEffect, useState } from 'react';
import {
  Linkedin,
  Users,
  Eye,
  Heart,
  FileText,
  TrendingUp,
  MessageCircle,
  Share2,
  MapPin,
  BriefcaseBusiness,
  RefreshCw,
} from 'lucide-react';

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
} from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const API_URL = 'http://127.0.0.1:8000';

interface Profile {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  headline: string;
  location: string;
  profile_url: string;
  profile_image: string | null;
  followers: number;
  connections: number;
  is_mock: boolean;
}

interface Overview {
  platform: string;
  period: string;
  followers: number;
  followers_change: number;
  impressions: number;
  impressions_change: number;
  engagements: number;
  engagement_change: number;
  engagement_rate: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  posts: number;
  profile_views: number;
  is_mock: boolean;
}

interface DailyAnalytics {
  date: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagements: number;
}

interface TopPost {
  id: string;
  text: string;
  published_at: string;
  type: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagement_rate: number;
}

interface AudienceItem {
  country?: string;
  title?: string;
  industry?: string;
  percentage: number;
}

interface Audience {
  countries: AudienceItem[];
  job_titles: AudienceItem[];
  industries: AudienceItem[];
}

interface GrowthMetric {
  current: number;
  previous: number;
  growth: number;
}

interface Growth {
  followers: GrowthMetric;
  engagement: GrowthMetric;
  impressions: GrowthMetric;
}

export default function LinkedInAnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [daily, setDaily] = useState<DailyAnalytics[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [growth, setGrowth] = useState<Growth | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getToken = () => {
    return localStorage.getItem('creatoriq_token');
  };

  const connectLinkedIn = async () => {
    const token = getToken();

    if (!token) {
      alert('Please log in to CreatorIQ first.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/linkedin/connect/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to start LinkedIn connection'
        );
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error('LinkedIn authorization URL was not returned');
      }
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      alert('Unable to connect LinkedIn. Please try again.');
    }
  };

  async function fetchApi(endpoint: string) {
    const token = getToken();

    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError('');

      const [
        profileData,
        overviewData,
        dailyData,
        postsData,
        audienceData,
        growthData,
      ] = await Promise.all([
        fetchApi('/linkedin/profile'),
        fetchApi('/linkedin/analytics/overview'),
        fetchApi('/linkedin/analytics/daily'),
        fetchApi('/linkedin/analytics/top-posts'),
        fetchApi('/linkedin/analytics/audience'),
        fetchApi('/linkedin/analytics/growth'),
      ]);

      setProfile(profileData);
      setOverview(overviewData);
      setDaily(dailyData.data || []);
      setTopPosts(postsData.posts || []);
      setAudience(audienceData);
      setGrowth(growthData);
    } catch (err) {
      console.error(err);

      setError(
        'Unable to load LinkedIn analytics. Make sure the backend is running and you are logged in.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const chartData = daily.map((item) => ({
    date: item.date.slice(5),
    impressions: item.impressions,
    engagements: item.engagements,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-80 bg-muted animate-pulse rounded mt-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-80 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Linkedin className="w-12 h-12 mx-auto mb-4 text-blue-500" />

            <h2 className="text-xl font-semibold mb-2">
              LinkedIn Analytics
            </h2>

            <p className="text-muted-foreground mb-6">
              {error}
            </p>

            <Button onClick={loadAnalytics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
            <Linkedin className="w-7 h-7" />
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">
                LinkedIn Analytics
              </h1>

              <Badge
                variant="secondary"
                className="text-blue-600 border-blue-200"
              >
                MOCK DATA
              </Badge>
            </div>

            <p className="text-muted-foreground mt-1">
              Track your LinkedIn creator performance and audience growth.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button onClick={connectLinkedIn}>
            <Linkedin className="w-4 h-4 mr-2" />
            Connect LinkedIn
          </Button>
        </div>
      </div>

      {/* Profile */}
      {profile && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                {profile.first_name?.charAt(0)}
                {profile.last_name?.charAt(0)}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {profile.name}
                </h2>

                <p className="text-muted-foreground mt-1">
                  {profile.headline}
                </p>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {formatNumber(profile.connections)} connections
                  </span>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="text-2xl font-bold">
                  {formatNumber(profile.followers)}
                </p>

                <p className="text-sm text-muted-foreground">
                  Followers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Followers
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    {formatNumber(overview.followers)}
                  </p>

                  <p className="text-sm text-green-600 mt-2">
                    {formatPercentage(overview.followers_change)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Impressions
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    {formatNumber(overview.impressions)}
                  </p>

                  <p className="text-sm text-green-600 mt-2">
                    {formatPercentage(overview.impressions_change)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Engagement Rate
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    {overview.engagement_rate.toFixed(2)}%
                  </p>

                  <p className="text-sm text-green-600 mt-2">
                    {formatPercentage(overview.engagement_change)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500">
                  <Heart className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Posts
                  </p>

                  <p className="text-2xl font-bold mt-2">
                    {overview.posts}
                  </p>

                  <p className="text-sm text-muted-foreground mt-2">
                    Last 30 days
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Performance</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="impressions"
                  strokeWidth={3}
                  dot={false}
                  name="Impressions"
                />

                <Line
                  type="monotone"
                  dataKey="engagements"
                  strokeWidth={3}
                  dot={false}
                  name="Engagements"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement breakdown */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-500" />

                <div>
                  <p className="text-sm text-muted-foreground">
                    Likes
                  </p>

                  <p className="text-xl font-bold">
                    {formatNumber(overview.likes)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-blue-500" />

                <div>
                  <p className="text-sm text-muted-foreground">
                    Comments
                  </p>

                  <p className="text-xl font-bold">
                    {formatNumber(overview.comments)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-green-500" />

                <div>
                  <p className="text-sm text-muted-foreground">
                    Shares
                  </p>

                  <p className="text-xl font-bold">
                    {formatNumber(overview.shares)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />

                <div>
                  <p className="text-sm text-muted-foreground">
                    Profile Views
                  </p>

                  <p className="text-xl font-bold">
                    {formatNumber(overview.profile_views)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Growth */}
      {growth && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Growth Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Followers</span>
                </div>

                <p className="text-2xl font-bold">
                  {formatNumber(growth.followers.current)}
                </p>

                <p className="text-sm text-green-600 mt-2">
                  +{growth.followers.growth.toFixed(1)}% growth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="font-medium">Engagement</span>
                </div>

                <p className="text-2xl font-bold">
                  {growth.engagement.current.toFixed(2)}%
                </p>

                <p className="text-sm text-green-600 mt-2">
                  +{growth.engagement.growth.toFixed(1)}% growth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Impressions</span>
                </div>

                <p className="text-2xl font-bold">
                  {formatNumber(growth.impressions.current)}
                </p>

                <p className="text-sm text-green-600 mt-2">
                  +{growth.impressions.growth.toFixed(1)}% growth
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top LinkedIn Posts</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium leading-relaxed">
                      {post.text}
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(post.published_at).toLocaleDateString()}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {formatNumber(post.likes)}
                      </span>

                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {formatNumber(post.comments)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {formatNumber(post.shares)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatNumber(post.impressions)}
                      </span>

                      <Badge variant="secondary">
                        {post.engagement_rate.toFixed(2)}% engagement
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audience */}
      {audience && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Countries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Audience Countries
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={audience.countries}
                    layout="vertical"
                    margin={{
                      left: 10,
                      right: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      type="number"
                      domain={[0, 60]}
                    />

                    <YAxis
                      type="category"
                      dataKey="country"
                      width={80}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="percentage"
                      name="Audience %"
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Job Titles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="w-5 h-5" />
                Job Titles
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {audience.job_titles.map((item) => (
                  <div key={item.title}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.title}</span>

                      <span className="font-medium">
                        {item.percentage}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industries */}
          <Card>
            <CardHeader>
              <CardTitle>Industries</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {audience.industries.map((item) => (
                  <div key={item.industry}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.industry}</span>

                      <span className="font-medium">
                        {item.percentage}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}