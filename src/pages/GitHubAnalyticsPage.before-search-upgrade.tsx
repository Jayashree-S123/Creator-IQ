import { useEffect, useMemo, useState } from 'react';
import {
  Github,
  Users,
  Star,
  GitFork,
  GitCommit,
  GitPullRequest,
  CircleDot,
  Code2,
  MapPin,
  Building2,
  RefreshCw,
  ExternalLink,
  BookOpen,
  TrendingUp,
  Activity,
  Award,
  Zap,
  Eye,
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const API_URL = 'http://127.0.0.1:8000';

interface Profile {
  username: string;
  name: string;
  bio: string;
  location: string;
  company: string;
  profile_url: string;
  followers: number;
  following: number;
  public_repositories: number;
  public_gists: number;
  is_mock: boolean;
}

interface Overview {
  followers: number;
  followers_change: number;
  repositories: number;
  repositories_change: number;
  stars: number;
  stars_change: number;
  forks: number;
  forks_change: number;
  commits: number;
  commits_change: number;
  pull_requests: number;
  issues: number;
  is_mock: boolean;
}

interface DailyItem {
  date: string;
  commits: number;
  pull_requests: number;
  issues: number;
  reviews: number;
  activity: number;
}

interface Repository {
  id: string;
  name: string;
  full_name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  open_issues: number;
  watchers: number;
  commits: number;
  updated_at: string;
  url: string;
  is_private: boolean;
}

interface Language {
  language: string;
  percentage: number;
}

interface GrowthMetric {
  current: number;
  previous: number;
  growth: number;
}

interface Growth {
  followers: GrowthMetric;
  stars: GrowthMetric;
  forks: GrowthMetric;
  commits: GrowthMetric;
}

const chartColors = [
  'hsl(var(--primary))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--foreground))',
  'hsl(var(--border))',
  'hsl(var(--accent-foreground))',
];

export default function GitHubAnalyticsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [daily, setDaily] = useState<DailyItem[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [growth, setGrowth] = useState<Growth | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [mode, setMode] = useState<'mock' | 'real'>('mock');
  const [githubUsername, setGithubUsername] = useState('octocat');

  const fetchApi = async (path: string) => {
    const token = localStorage.getItem('creatoriq_token');

    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  };

  const loadAnalytics = async () => {
    try {
      setError('');

      if (mode === 'mock') {
        const [
          profileData,
          overviewData,
          dailyData,
          repositoriesData,
          languagesData,
          growthData,
        ] = await Promise.all([
          fetchApi('/github/profile'),
          fetchApi('/github/analytics/overview'),
          fetchApi('/github/analytics/daily'),
          fetchApi('/github/analytics/top-repositories'),
          fetchApi('/github/analytics/languages'),
          fetchApi('/github/analytics/growth'),
        ]);

        setProfile(profileData);
        setOverview(overviewData);
        setDaily(dailyData.data || []);
        setRepositories(repositoriesData.repositories || []);
        setLanguages(languagesData.languages || []);
        setGrowth(growthData);

        return;
      }

      const advancedData = await fetchApi(
        `/github/real/${githubUsername}/advanced`
      );

      const realProfile = advancedData.profile;
      const summary = advancedData.summary;

      const realTopRepositories =
        advancedData.top_repositories?.repositories || [];

      const realLanguages =
        advancedData.languages?.languages || [];

      const realOverview: Overview = {
        followers: summary.followers || 0,
        followers_change: 0,
        repositories: summary.repositories || 0,
        repositories_change: 0,
        stars: summary.stars || 0,
        stars_change: 0,
        forks: summary.forks || 0,
        forks_change: 0,
        commits: summary.commits || 0,
        commits_change: 0,
        pull_requests: summary.pull_requests || 0,
        issues: summary.issues || 0,
        is_mock: false,
      };

      const eventCounts: Record<string, number> = {};

      (advancedData.activity?.events || []).forEach(
        (event: { type: string; created_at: string }) => {
          const date = event.created_at?.split('T')[0];

          if (date) {
            eventCounts[date] =
              (eventCounts[date] || 0) + 1;
          }
        }
      );

      const realDaily: DailyItem[] = Object.entries(eventCounts)
        .map(([date, activity]) => ({
          date,
          commits: 0,
          pull_requests: 0,
          issues: 0,
          reviews: 0,
          activity,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const realGrowth: Growth = {
        followers: {
          current: summary.followers || 0,
          previous: summary.followers || 0,
          growth: 0,
        },
        stars: {
          current: summary.stars || 0,
          previous: summary.stars || 0,
          growth: 0,
        },
        forks: {
          current: summary.forks || 0,
          previous: summary.forks || 0,
          growth: 0,
        },
        commits: {
          current: summary.commits || 0,
          previous: summary.commits || 0,
          growth: 0,
        },
      };

      setProfile({
        ...realProfile,
        following:
          summary.following ??
          realProfile.following ??
          0,
      });

      setOverview(realOverview);
      setDaily(realDaily);
      setRepositories(realTopRepositories);
      setLanguages(realLanguages);
      setGrowth(realGrowth);
    } catch (err) {
      console.error(err);

      setError(
        mode === 'real'
          ? `Unable to load real GitHub data for "${githubUsername}". Check the username and make sure the backend is running.`
          : 'Unable to load GitHub analytics. Make sure the backend is running and you are logged in.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAnalytics();
  }, [mode, githubUsername]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US').format(value || 0);

  const formatDate = (value: string) => {
    const date = new Date(value);

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const activityData = daily.map((item) => ({
    ...item,
    label: formatDate(item.date),
  }));

  const repositoryChartData = repositories
    .slice(0, 6)
    .map((repo) => ({
      name:
        repo.name.length > 14
          ? `${repo.name.slice(0, 14)}…`
          : repo.name,
      stars: repo.stars,
      forks: repo.forks,
    }));

  const engagementData = repositories
    .slice(0, 6)
    .map((repo) => ({
      name:
        repo.name.length > 12
          ? `${repo.name.slice(0, 12)}…`
          : repo.name,
      stars: repo.stars,
      forks: repo.forks,
      issues: repo.open_issues,
    }));

  const creatorScore = useMemo(() => {
    if (!overview) return 0;

    const followerScore = Math.min(25, overview.followers / 40);
    const starScore = Math.min(25, overview.stars / 20);
    const forkScore = Math.min(15, overview.forks / 10);
    const repositoryScore = Math.min(15, overview.repositories * 1.5);
    const activityScore = Math.min(
      20,
      overview.commits / 10
    );

    return Math.min(
      100,
      Math.round(
        followerScore +
          starScore +
          forkScore +
          repositoryScore +
          activityScore
      )
    );
  }, [overview]);

  const totalLanguagePercentage = languages.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  const topLanguage =
    languages.length > 0 ? languages[0].language : 'N/A';

  const topRepository =
    repositories.length > 0 ? repositories[0] : null;

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-72 bg-muted rounded-xl" />
          <div className="h-5 w-96 bg-muted rounded" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item}>
                <CardContent className="p-6">
                  <div className="h-24 bg-muted rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="h-80 bg-muted rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <Github className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

            <h2 className="text-xl font-semibold mb-2">
              GitHub Analytics
            </h2>

            <p className="text-sm text-muted-foreground mb-6">
              {error}
            </p>

            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || !overview || !growth) {
    return null;
  }

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center">
              <Github className="w-6 h-6" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              GitHub Analytics
            </h1>

            <Badge variant={mode === 'mock' ? 'secondary' : 'default'}>
              {mode === 'mock' ? 'MOCK DATA' : 'REAL GITHUB'}
            </Badge>
          </div>

          <p className="text-muted-foreground mt-2">
            Understand development activity, repository performance,
            audience reach and GitHub growth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={mode === 'mock' ? 'default' : 'outline'}
            onClick={() => setMode('mock')}
          >
            Mock
          </Button>

          <Button
            variant={mode === 'real' ? 'default' : 'outline'}
            onClick={() => setMode('real')}
          >
            Real GitHub
          </Button>

          {mode === 'real' && (
            <input
              value={githubUsername}
              onChange={(e) =>
                setGithubUsername(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setLoading(true);
                  loadAnalytics();
                }
              }}
              placeholder="GitHub username"
              className="h-10 w-48 rounded-md border bg-background px-3 text-sm"
            />
          )}

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Profile */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-sm">
              <Github className="w-10 h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {profile.name}
                </h2>

                <span className="text-muted-foreground">
                  @{profile.username}
                </span>
              </div>

              <p className="text-muted-foreground mt-1 line-clamp-2">
                {profile.bio || 'GitHub creator profile'}
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}

                {profile.company && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {profile.company}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {formatNumber(profile.following)} following
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                window.open(profile.profile_url, '_blank')
              }
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View GitHub
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>

              <Badge variant="outline">
                Audience
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Followers
            </p>

            <p className="text-3xl font-bold mt-1">
              {formatNumber(overview.followers)}
            </p>

            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Community reach
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>

              <Badge variant="outline">
                Projects
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Repositories
            </p>

            <p className="text-3xl font-bold mt-1">
              {formatNumber(overview.repositories)}
            </p>

            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Code2 className="w-4 h-4" />
              Public projects
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>

              <Badge variant="outline">
                Impact
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Stars
            </p>

            <p className="text-3xl font-bold mt-1">
              {formatNumber(overview.stars)}
            </p>

            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Award className="w-4 h-4" />
              Repository recognition
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <GitFork className="w-5 h-5" />
              </div>

              <Badge variant="outline">
                Reach
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Forks
            </p>

            <p className="text-3xl font-bold mt-1">
              {formatNumber(overview.forks)}
            </p>

            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4" />
              Developer adoption
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score + quick insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              GitHub Creator Score
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-40 h-40 rounded-full border-[12px] border-muted flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold">
                    {creatorScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    out of 100
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Badge variant="secondary">
                {creatorScore >= 80
                  ? 'Excellent'
                  : creatorScore >= 60
                    ? 'Strong'
                    : creatorScore >= 40
                      ? 'Growing'
                      : 'Getting Started'}
              </Badge>

              <p className="text-sm text-muted-foreground mt-3">
                Based on audience, repository activity,
                stars, forks and development output.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Insights
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Top programming language
              </p>
              <p className="font-semibold mt-1">
                {topLanguage}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Top repository
              </p>
              <p className="font-semibold mt-1">
                {topRepository?.name || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Development activity
              </p>
              <p className="font-semibold mt-1">
                {formatNumber(overview.commits)} commits
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Development Summary
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Commits
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(overview.commits)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Pull Requests
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(overview.pull_requests)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Issues
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(overview.issues)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Gists
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(profile.public_gists)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main activity graph */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle>Development Activity</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Important activity points across the available period.
              </p>
            </div>

            <Badge variant="outline">
              {activityData.length} activity points
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="activity"
                  name="Activity"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.12}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stars / forks graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader>
            <CardTitle>Repository Recognition</CardTitle>
            <p className="text-sm text-muted-foreground">
              Stars and forks across your leading repositories.
            </p>
          </CardHeader>

          <CardContent>
            <div className="h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={repositoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="stars"
                    name="Stars"
                    fill="hsl(var(--primary))"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="forks"
                    name="Forks"
                    fill="hsl(var(--muted-foreground))"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repository Engagement</CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare stars, forks and open issues.
            </p>
          </CardHeader>

          <CardContent>
            <div className="h-[330px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={engagementData}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis type="number" />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 10 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="stars"
                    name="Stars"
                    fill="hsl(var(--primary))"
                  />

                  <Bar
                    dataKey="forks"
                    name="Forks"
                    fill="hsl(var(--muted-foreground))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <GitCommit className="w-5 h-5 mb-3" />
            <p className="text-sm text-muted-foreground">
              Commits
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(overview.commits)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <GitPullRequest className="w-5 h-5 mb-3" />
            <p className="text-sm text-muted-foreground">
              Pull Requests
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(overview.pull_requests)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <CircleDot className="w-5 h-5 mb-3" />
            <p className="text-sm text-muted-foreground">
              Issues
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(overview.issues)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Eye className="w-5 h-5 mb-3" />
            <p className="text-sm text-muted-foreground">
              Watchers
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(
                repositories.reduce(
                  (sum, repo) => sum + (repo.watchers || 0),
                  0
                )
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Overview</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              ['Followers', growth.followers],
              ['Stars', growth.stars],
              ['Forks', growth.forks],
              ['Commits', growth.commits],
            ].map(([label, metric]) => {
              const item = metric as GrowthMetric;

              return (
                <div key={label as string}>
                  <p className="text-sm text-muted-foreground">
                    {label as string}
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {formatNumber(item.current)}
                  </p>

                  <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    {item.growth >= 0 ? '+' : ''}
                    {item.growth}% growth
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top repositories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Top GitHub Repositories</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your strongest repositories by GitHub engagement.
              </p>
            </div>

            <Badge variant="outline">
              {repositories.length} repositories
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {repositories.map((repo, index) => (
              <div
                key={repo.id}
                className="group border rounded-xl p-4 hover:bg-muted/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">

                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold shrink-0">
                    #{index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {repo.name}
                      </h3>

                      {repo.language && (
                        <Badge variant="outline">
                          {repo.language}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {repo.description || 'No description available.'}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {formatNumber(repo.stars)}
                      </span>

                      <span className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        {formatNumber(repo.forks)}
                      </span>

                      <span className="flex items-center gap-1">
                        <CircleDot className="w-4 h-4" />
                        {formatNumber(repo.open_issues)} issues
                      </span>

                      <span className="flex items-center gap-1">
                        <GitCommit className="w-4 h-4" />
                        {formatNumber(repo.commits)} commits
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(repo.url, '_blank')
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {repositories.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                No repositories available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Programming Languages</CardTitle>
          <p className="text-sm text-muted-foreground">
            Technology distribution across your repositories.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languages}
                    dataKey="percentage"
                    nameKey="language"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={55}
                    paddingAngle={2}
                  >
                    {languages.map((_, index) => (
                      <Cell
                        key={`language-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={languages}
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    type="number"
                    domain={[0, Math.max(100, totalLanguagePercentage)]}
                  />

                  <YAxis
                    type="category"
                    dataKey="language"
                    width={90}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="percentage"
                    name="Usage %"
                    fill="hsl(var(--primary))"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
