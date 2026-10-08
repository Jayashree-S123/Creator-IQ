import React, { useState } from 'react';
import {
  Youtube,
  Play,
  Clock,
  Eye,
  TrendingUp,
  ExternalLink,
  Calendar,
  Sparkles,
  BarChart2,
  Tv,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function YouTubeAnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>('28d');

  // YouTube Top Performance Videos
  const topVideos = [
    {
      id: 'yt-1',
      title: 'Top 10 AI Tools That Changed My Productivity in 2026',
      published: 'Sep 18, 2026',
      views: 184500,
      watchHours: 14200,
      avgDuration: '4:36',
      retention: '58.2%',
      ctr: '8.4%',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      url: 'https://youtube.com/watch?v=demo1'
    },
    {
      id: 'yt-2',
      title: 'Clean Minimalist Desk Setup 2026 — Ultimate Tour',
      published: 'Sep 12, 2026',
      views: 312000,
      watchHours: 26800,
      avgDuration: '5:10',
      retention: '62.4%',
      ctr: '9.2%',
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
      url: 'https://youtube.com/watch?v=demo2'
    },
    {
      id: 'yt-3',
      title: 'Why I am officially switching from Chrome to Zen Browser',
      published: 'Sep 17, 2026',
      views: 92400,
      watchHours: 7100,
      avgDuration: '4:40',
      retention: '51.8%',
      ctr: '7.1%',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
      url: 'https://youtube.com/watch?v=demo3'
    },
    {
      id: 'yt-4',
      title: 'How I Built a 6-Figure Creator Business on YouTube',
      published: 'Aug 29, 2026',
      views: 142000,
      watchHours: 16400,
      avgDuration: '6:55',
      retention: '64.0%',
      ctr: '8.8%',
      thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
      url: 'https://youtube.com/watch?v=demo4'
    }
  ];

  // Daily Watch Hours Chart Data
  const watchTimeData = [
    { day: 'Sep 01', hours: 820, impressions: 42000 },
    { day: 'Sep 05', hours: 940, impressions: 49000 },
    { day: 'Sep 10', hours: 1450, impressions: 78000 },
    { day: 'Sep 15', hours: 1220, impressions: 68000 },
    { day: 'Sep 20', hours: 2100, impressions: 114000 },
    { day: 'Sep 24', hours: 2450, impressions: 132000 }
  ];

  // Traffic Sources
  const trafficSources = [
    { source: 'YouTube Browse Features (Home / Feed)', percent: 48 },
    { source: 'Suggested Videos (Up Next)', percent: 28 },
    { source: 'YouTube Search', percent: 14 },
    { source: 'External & Direct Links', percent: 6 },
    { source: 'Other Channel Pages', percent: 4 }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Channel Info */}
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
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Verified Partner</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live API integration for Alex Rivera Tech (Channel ID: UC-924xRiveraDemo)
            </p>
          </div>
        </div>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="bg-card w-36 h-9 text-xs">
            <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="28d">Last 28 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="365d">Last 365 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Core YouTube KPIs (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">542,800</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">+24,800 this period</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Watch Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">64,500 hrs</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">+18.2% vs benchmark</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Impressions CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">8.4%</div>
            <p className="text-xs text-muted-foreground mt-1">1.8M Total Impressions</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Avg View Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4m 48s</div>
            <p className="text-xs text-muted-foreground mt-1">56.4% retention rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Watch Time Trend Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Watch Time Volume (Hours / Day)</CardTitle>
          <CardDescription className="text-xs">Cumulative viewer consumption over the past 28 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full min-w-0 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={watchTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number) => [`${val.toLocaleString()} hours`, 'Watch Time']}
                />
                <Area type="monotone" dataKey="hours" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#ytGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Videos Table & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Videos Table */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Top Performing YouTube Videos</CardTitle>
            <CardDescription className="text-xs">Detailed metrics sorted by algorithmic reach and watch retention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topVideos.map(video => (
              <div key={video.id} className="p-3 rounded-lg border border-border/80 bg-background/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 h-12 object-cover rounded-md border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-foreground truncate" title={video.title}>
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                      <span>{video.views.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{video.watchHours.toLocaleString()} hrs</span>
                      <span>•</span>
                      <span className="text-emerald-500 font-medium">CTR: {video.ctr}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-foreground">{video.avgDuration}</div>
                  <div className="text-[10px] text-muted-foreground">Retention: {video.retention}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Traffic Sources Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Traffic Acquisition Sources</CardTitle>
            <CardDescription className="text-xs">How viewers discovered your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trafficSources.map(item => (
              <div key={item.source} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[200px]" title={item.source}>
                    {item.source}
                  </span>
                  <span className="font-semibold text-foreground">{item.percent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}