import React, { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Globe,
  Smartphone,
  Laptop,
  BarChart3
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';


const API_URL = 'http://127.0.0.1:8000';


interface SummaryData {
  total_content: number;
  total_views: number;
  total_reach: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  total_engagement: number;
  engagement_rate: number;
  average_watch_time: number;
  platform: string;
}


interface PlatformData {
  platform: string;
  content: number;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement: number;
}


interface ActivityData {
  hour: number;
  active_content: number;
}


export default function AudiencePage() {

  const [platform, setPlatform] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  const [summary, setSummary] =
    useState<SummaryData | null>(null);

  const [platformData, setPlatformData] =
    useState<PlatformData[]>([]);

  const [activityData, setActivityData] =
    useState<ActivityData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


 const getToken = () => {
  return localStorage.getItem('creatoriq_token');
};


  const fetchAudienceData = async () => {

    try {

      setLoading(true);
      setError('');

      const token = getToken();

      if (!token) {
        setError(
          'Authentication token not found. Please login again.'
        );

        setLoading(false);
        return;
      }


      const headers = {
        Authorization: `Bearer ${token}`
      };


     const days = timeRange === '7d'
  ? 7
  : timeRange === '90d'
    ? 90
    : 30;

const summaryResponse = await fetch(
  `${API_URL}/audience/summary?platform=${platform}&days=${days}`,
  { headers }
);


     const platformResponse = await fetch(
  `${API_URL}/audience/platform?platform=${platform}&days=${days}`,
  { headers }
);


     const activityResponse = await fetch(
  `${API_URL}/audience/activity?platform=${platform}&days=${days}`,
  { headers }
);


      if (!summaryResponse.ok) {
        throw new Error(
          'Failed to fetch audience summary'
        );
      }


      if (!platformResponse.ok) {
        throw new Error(
          'Failed to fetch platform analytics'
        );
      }


      if (!activityResponse.ok) {
        throw new Error(
          'Failed to fetch audience activity'
        );
      }


      const summaryJson =
        await summaryResponse.json();

      const platformJson =
        await platformResponse.json();

      const activityJson =
        await activityResponse.json();


      setSummary(summaryJson);

      setPlatformData(
        platformJson.platforms || []
      );

      setActivityData(
        activityJson.activity || []
      );

    } catch (err) {

      console.error(err);

      setError(
        'Unable to load audience analytics.'
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchAudienceData();

  }, [platform, timeRange]);


  const formatNumber = (value: number) => {

    return new Intl.NumberFormat(
      'en-US'
    ).format(value || 0);

  };


  const formatWatchTime = (value: number) => {

    if (!value) {
      return '0';
    }

    return `${value.toFixed(1)} min`;

  };


  const activityChartData =
    activityData.map(item => ({
      time: `${item.hour}:00`,
      active: item.active_content
    }));


  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">

        <div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Audience Analytics
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Understand your audience reach, engagement,
            platforms, and activity.
          </p>

        </div>


        <div className="flex items-center gap-2.5">

          <Select
            value={platform}
            onValueChange={setPlatform}
          >

            <SelectTrigger className="bg-card w-36 h-9 text-xs">

              <SelectValue placeholder="Platform" />

            </SelectTrigger>


            <SelectContent className="bg-card">

              <SelectItem value="all">
                All Channels
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

            </SelectContent>

          </Select>


          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >

            <SelectTrigger className="bg-card w-32 h-9 text-xs">

              <SelectValue placeholder="Timeframe" />

            </SelectTrigger>


            <SelectContent className="bg-card">

              <SelectItem value="7d">
                Last 7 Days
              </SelectItem>

              <SelectItem value="30d">
                Last 30 Days
              </SelectItem>

              <SelectItem value="90d">
                Last 90 Days
              </SelectItem>

            </SelectContent>

          </Select>

        </div>

      </div>


      {/* Error */}

      {error && (

        <Card className="border-destructive">

          <CardContent className="p-4">

            <p className="text-sm text-destructive">
              {error}
            </p>

          </CardContent>

        </Card>

      )}


      {/* Loading */}

      {loading ? (

        <Card>

          <CardContent className="p-8 text-center">

            <p className="text-sm text-muted-foreground">
              Loading audience analytics...
            </p>

          </CardContent>

        </Card>

      ) : (

        <>

          {/* KPI CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


            {/* Reach */}

            <Card className="bg-card border-border">

              <CardHeader className="pb-2">

                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Total Reach
                </CardTitle>

              </CardHeader>


              <CardContent>

                <div className="flex items-center justify-between">

                  <div className="text-2xl font-bold">
                    {formatNumber(
                      summary?.total_reach || 0
                    )}
                  </div>

                  <Users className="w-5 h-5 text-primary" />

                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Audience reached
                </p>

              </CardContent>

            </Card>


            {/* Views */}

            <Card className="bg-card border-border">

              <CardHeader className="pb-2">

                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Total Views
                </CardTitle>

              </CardHeader>


              <CardContent>

                <div className="flex items-center justify-between">

                  <div className="text-2xl font-bold">
                    {formatNumber(
                      summary?.total_views || 0
                    )}
                  </div>

                  <Eye className="w-5 h-5 text-primary" />

                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Across your content
                </p>

              </CardContent>

            </Card>


            {/* Engagement */}

            <Card className="bg-card border-border">

              <CardHeader className="pb-2">

                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Engagement Rate
                </CardTitle>

              </CardHeader>


              <CardContent>

                <div className="flex items-center justify-between">

                  <div className="text-2xl font-bold">
                    {summary?.engagement_rate || 0}%
                  </div>

                  <Heart className="w-5 h-5 text-primary" />

                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Engagement ÷ reach
                </p>

              </CardContent>

            </Card>


            {/* Watch Time */}

            <Card className="bg-card border-border">

              <CardHeader className="pb-2">

                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                  Avg Watch Time
                </CardTitle>

              </CardHeader>


              <CardContent>

                <div className="flex items-center justify-between">

                  <div className="text-2xl font-bold">
                    {formatWatchTime(
                      summary?.average_watch_time || 0
                    )}
                  </div>

                  <Clock className="w-5 h-5 text-primary" />

                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Per content item
                </p>

              </CardContent>

            </Card>

          </div>


          {/* ENGAGEMENT */}

          <Card className="bg-card border-border">

            <CardHeader>

              <CardTitle className="text-base font-semibold">
                Audience Engagement
              </CardTitle>

              <CardDescription className="text-xs">
                Total interactions generated by your audience
              </CardDescription>

            </CardHeader>


            <CardContent>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">


                {/* Likes */}

                <div className="p-4 rounded-lg bg-muted/40 border border-border">

                  <Heart className="w-5 h-5 text-primary mb-2" />

                  <div className="text-xl font-bold">
                    {formatNumber(
                      summary?.total_likes || 0
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Likes
                  </div>

                </div>


                {/* Comments */}

                <div className="p-4 rounded-lg bg-muted/40 border border-border">

                  <MessageCircle className="w-5 h-5 text-primary mb-2" />

                  <div className="text-xl font-bold">
                    {formatNumber(
                      summary?.total_comments || 0
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Comments
                  </div>

                </div>


                {/* Shares */}

                <div className="p-4 rounded-lg bg-muted/40 border border-border">

                  <Share2 className="w-5 h-5 text-primary mb-2" />

                  <div className="text-xl font-bold">
                    {formatNumber(
                      summary?.total_shares || 0
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Shares
                  </div>

                </div>


                {/* Saves */}

                <div className="p-4 rounded-lg bg-muted/40 border border-border">

                  <Bookmark className="w-5 h-5 text-primary mb-2" />

                  <div className="text-xl font-bold">
                    {formatNumber(
                      summary?.total_saves || 0
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Saves
                  </div>

                </div>

              </div>

            </CardContent>

          </Card>


          {/* PLATFORM + ACTIVITY */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


            {/* PLATFORM */}

            <Card className="bg-card border-border">

              <CardHeader>

                <CardTitle className="text-base font-semibold">
                  Platform Distribution
                </CardTitle>

                <CardDescription className="text-xs">
                  Content and audience performance by platform
                </CardDescription>

              </CardHeader>


              <CardContent>

                {platformData.length === 0 ? (

                  <div className="text-center py-10">

                    <Globe className="w-8 h-8 mx-auto text-muted-foreground mb-2" />

                    <p className="text-sm text-muted-foreground">
                      No platform data available yet.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {platformData.map(item => (

                      <div
                        key={item.platform}
                        className="space-y-2"
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-2">

                            <Globe className="w-4 h-4 text-primary" />

                            <span className="text-sm font-medium">
                              {item.platform}
                            </span>

                          </div>

                          <span className="text-xs text-muted-foreground">
                            {item.content} content
                          </span>

                        </div>


                        <div className="grid grid-cols-3 gap-2 text-xs">

                          <div className="p-2 rounded bg-muted/40">

                            <div className="font-semibold">
                              {formatNumber(item.views)}
                            </div>

                            <div className="text-muted-foreground">
                              Views
                            </div>

                          </div>


                          <div className="p-2 rounded bg-muted/40">

                            <div className="font-semibold">
                              {formatNumber(item.reach)}
                            </div>

                            <div className="text-muted-foreground">
                              Reach
                            </div>

                          </div>


                          <div className="p-2 rounded bg-muted/40">

                            <div className="font-semibold">
                              {formatNumber(item.engagement)}
                            </div>

                            <div className="text-muted-foreground">
                              Engagement
                            </div>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </CardContent>

            </Card>


            {/* ACTIVITY CHART */}

            <Card className="bg-card border-border">

              <CardHeader>

                <CardTitle className="text-base font-semibold">
                  Content Activity by Hour
                </CardTitle>

                <CardDescription className="text-xs">
                  Number of content items published at each hour
                </CardDescription>

              </CardHeader>


              <CardContent>

                <div className="w-full min-w-0 h-64">

                  {activityChartData.length === 0 ? (

                    <div className="h-full flex items-center justify-center">

                      <BarChart3 className="w-8 h-8 text-muted-foreground mr-2" />

                      <span className="text-sm text-muted-foreground">
                        No activity data available.
                      </span>

                    </div>

                  ) : (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={activityChartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: -20,
                          bottom: 0
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="time"
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
                            fontSize: '12px'
                          }}
                        />

                        <Bar
                          dataKey="active"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  )}

                </div>

              </CardContent>

            </Card>

          </div>


          {/* AUDIENCE DATA AVAILABILITY */}

          <Card className="bg-card border-border">

            <CardHeader>

              <CardTitle className="text-base font-semibold">
                Audience Demographics
              </CardTitle>

              <CardDescription className="text-xs">
                Demographic analytics from connected social platforms
              </CardDescription>

            </CardHeader>


            <CardContent>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                <div className="p-4 rounded-lg border border-border bg-muted/40">

                  <Smartphone className="w-5 h-5 text-primary mb-2" />

                  <div className="font-semibold text-sm">
                    Device Analytics
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    Device-level audience data will be populated
                    through connected platform APIs.
                  </p>

                </div>


                <div className="p-4 rounded-lg border border-border bg-muted/40">

                  <Users className="w-5 h-5 text-primary mb-2" />

                  <div className="font-semibold text-sm">
                    Age & Gender
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    Age and gender analytics require demographic
                    information from the connected platform.
                  </p>

                </div>


                <div className="p-4 rounded-lg border border-border bg-muted/40">

                  <Laptop className="w-5 h-5 text-primary mb-2" />

                  <div className="font-semibold text-sm">
                    Geographic Audience
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    Country and regional audience data will come
                    from connected platform analytics APIs.
                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

        </>

      )}

    </div>
  );
}