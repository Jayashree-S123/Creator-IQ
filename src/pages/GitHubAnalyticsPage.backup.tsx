import { useEffect, useState } from 'react';
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

      // --------------------------------------------------
      // MOCK MODE
      // --------------------------------------------------
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
        setDaily(dailyData.data);
        setRepositories(repositoriesData.repositories);
        setLanguages(languagesData.languages);
        setGrowth(growthData);

        return;
      }

      // --------------------------------------------------
      // REAL MODE
      // --------------------------------------------------

      const advancedData = await fetchApi(
        `/github/real/${githubUsername}/advanced`
      );

      const realProfile = advancedData.profile;
      const summary = advancedData.summary;

      const realRepositories =
        advancedData.repositories?.repositories || [];

      const realTopRepositories =
        advancedData.top_repositories?.repositories || [];

      const realLanguages =
        advancedData.languages?.languages || [];

      // Use the real summary returned by the backend
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

      // Build activity from real GitHub events
      const eventCounts: Record<string, number> = {};

      (advancedData.activity?.events || []).forEach(
        (event: {
          type: string;
          created_at: string;
        }) => {
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

      // Build growth object
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
    new Intl.NumberFormat('en-US').format(value);

  const formatDate = (value: string) => {
    const date = new Date(value);

    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Github className="w-10 h-10 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">
            Loading GitHub analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Github className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />

            <h2 className="text-lg font-semibold mb-2">
              GitHub Analytics
            </h2>

            <p className="text-sm text-muted-foreground mb-5">
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

  const activityData = daily.map((item) => ({
    ...item,
    label: formatDate(item.date),
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              GitHub Analytics
            </h1>

                        <Badge
              variant={mode === 'mock' ? 'secondary' : 'default'}
            >
              {mode === 'mock' ? 'MOCK DATA' : 'REAL GITHUB'}
            </Badge>
          </div>

          <p className="text-muted-foreground mt-1">
            Track your GitHub development activity, repositories and growth.
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
              className="h-10 w-44 rounded-md border bg-background px-3 text-sm"
            />
          )}
        </div>

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

      {/* Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-foreground text-background flex items-center justify-center">
              <Github className="w-10 h-10" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {profile.name}
                </h2>

                <span className="text-muted-foreground">
                  @{profile.username}
                </span>
              </div>

              <p className="text-muted-foreground mt-1">
                {profile.bio}
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>

                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {profile.company}
                </span>

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

      {/* Main metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-green-600">
                +{overview.followers_change}%
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Followers
            </p>

            <p className="text-2xl font-bold mt-1">
              {formatNumber(overview.followers)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-green-600">
                +{overview.repositories_change}%
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Repositories
            </p>

            <p className="text-2xl font-bold mt-1">
              {formatNumber(overview.repositories)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <Star className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-green-600">
                +{overview.stars_change}%
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Stars
            </p>

            <p className="text-2xl font-bold mt-1">
              {formatNumber(overview.stars)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <GitFork className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-green-600">
                +{overview.forks_change}%
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Forks
            </p>

            <p className="text-2xl font-bold mt-1">
              {formatNumber(overview.forks)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity chart */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Development Activity</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="commits"
                  name="Commits"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="pull_requests"
                  name="Pull Requests"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="issues"
                  name="Issues"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <GitCommit className="w-5 h-5 mb-3 text-muted-foreground" />
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
            <GitPullRequest className="w-5 h-5 mb-3 text-muted-foreground" />
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
            <CircleDot className="w-5 h-5 mb-3 text-muted-foreground" />
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
            <Code2 className="w-5 h-5 mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Public Gists
            </p>
            <p className="text-2xl font-bold">
              {formatNumber(profile.public_gists)}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Followers
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatNumber(growth.followers.current)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +{growth.followers.growth}% growth
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Stars
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatNumber(growth.stars.current)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +{growth.stars.growth}% growth
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Forks
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatNumber(growth.forks.current)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +{growth.forks.growth}% growth
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Commits
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatNumber(growth.commits.current)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +{growth.commits.growth}% growth
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top repositories */}
      <Card>
        <CardHeader>
          <CardTitle>Top GitHub Repositories</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {repositories.map((repo, index) => (
              <div
                key={repo.id}
                className="border rounded-xl p-4"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {repo.name}
                      </h3>

                      <Badge variant="outline">
                        {repo.language}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {repo.description}
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

                      <span>
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
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle>Language Distribution</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languages}
                    dataKey="percentage"
                    nameKey="language"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ language, percentage }) =>
                      `${language} ${percentage}%`
                    }
                  >
                    {languages.map((_, index) => (
                      <Cell key={`cell-${index}`} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[300px]">
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
                    domain={[0, 40]}
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