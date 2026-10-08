import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

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

export default function GrowthPage() {
  const [timeframe, setTimeframe] = useState('6m');

  const [growthHistory, setGrowthHistory] = useState<GrowthRecord[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);

  const [loading, setLoading] = useState(true);
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

  const loadGrowthData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('creatoriq_token');

      if (!token) {
        setError('Authentication token not found.');
        return;
      }

      const days = getDays();

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      };

      const historyResponse = await fetch(
        `${API_URL}/growth/history?platform=all&days=${days}`,
        {
          headers
        }
      );

      const platformResponse = await fetch(
        `${API_URL}/growth/platform`,
        {
          headers
        }
      );

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
    }
  };

  useEffect(() => {
    loadGrowthData();
  }, [timeframe]);

  // -----------------------------------------
  // Prepare chart data
  // -----------------------------------------

  const chartData = growthHistory.map((item) => ({
    date: item.date,
    followers: item.followers,
    views: item.views,
    engagement: item.engagement
  }));

  // -----------------------------------------
  // Calculate totals
  // -----------------------------------------

  const totalFollowers =
    growthHistory.length > 0
      ? growthHistory[growthHistory.length - 1].followers
      : 0;

  const totalViews = growthHistory.reduce(
    (sum, item) => sum + item.views,
    0
  );

  const totalEngagement = growthHistory.reduce(
    (sum, item) => sum + item.engagement,
    0
  );

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          Loading growth analytics...
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // Error
  // -----------------------------------------

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-destructive font-medium">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Growth & Trends
          </h1>

          <p className="text-muted-foreground">
            Track your audience growth and performance over time.
          </p>
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-background"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="6m">Last 6 Months</option>
        </select>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Latest Followers
          </p>

          <p className="text-3xl font-bold mt-2">
            {totalFollowers.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Views
          </p>

          <p className="text-3xl font-bold mt-2">
            {totalViews.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Engagement
          </p>

          <p className="text-3xl font-bold mt-2">
            {totalEngagement.toLocaleString()}
          </p>
        </div>

      </div>

      {/* GROWTH CHART */}

      <div className="rounded-xl border bg-card p-6">

        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Audience Growth
          </h2>

          <p className="text-sm text-muted-foreground">
            Historical follower records from the database.
          </p>
        </div>

        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">
              No historical growth data available for this period.
            </p>
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="currentColor"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>

      {/* VIEWS & ENGAGEMENT */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="rounded-xl border bg-card p-6">

          <h2 className="text-lg font-semibold mb-5">
            Views History
          </h2>

          {chartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center">
              <p className="text-muted-foreground">
                No view history available.
              </p>
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="views"
                    fill="currentColor"
                  />

                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>

        {/* PLATFORM PERFORMANCE */}

        <div className="rounded-xl border bg-card p-6">

          <h2 className="text-lg font-semibold mb-5">
            Platform Performance
          </h2>

          {platformData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center">
              <p className="text-muted-foreground">
                No platform data available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {platformData.map((platform) => (
                <div
                  key={platform.platform}
                  className="border rounded-lg p-4"
                >

                  <div className="flex justify-between items-center">

                    <div>
                      <p className="font-semibold">
                        {platform.platform}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {platform.content} content items
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="font-bold">
                        {platform.views.toLocaleString()}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        views
                      </p>

                    </div>

                  </div>

                  <div className="mt-3 text-sm">
                    Engagement:{' '}
                    <span className="font-semibold">
                      {platform.engagement.toLocaleString()}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      {/* DATA STATUS */}

      <div className="rounded-xl border bg-muted/30 p-5">

        <p className="text-sm">
          <span className="font-semibold">
            Data source:
          </span>{' '}
          CreatorIQ PostgreSQL database
        </p>

        <p className="text-xs text-muted-foreground mt-1">
          Growth charts display recorded platform snapshots.
          Historical data will increase as new snapshots are recorded.
        </p>

      </div>

    </div>
  );
}