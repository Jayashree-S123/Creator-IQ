import { useState } from "react";
import {
  Search,
  Instagram,
  BadgeCheck,
  Lock,
  Globe,
  Users,
  Loader2,
} from "lucide-react";

import {
  getRelatedProfiles,
  getUserInfo,
  getMediaList,
} from "../services/instagramApi";

type Profile = {
  id: string;
  username: string;
  full_name: string;
  is_private: boolean;
  is_verified: boolean;
  profile_pic_url: string;
};

type UserInfo = {
  id: string;
  username: string;
  full_name: string;
  biography: string;
  external_url: string | null;
  profile_pic_url: string;

  edge_followed_by?: {
    count: number;
  };

  edge_follow?: {
    count: number;
  };

  is_verified?: boolean;
  is_private?: boolean;
  is_professional_account?: boolean;
  is_business_account?: boolean;
};

type MediaItem = {
  id: string;
  pk?: number;
  media_type: number;
  product_type?: string;
  display_uri?: string;

  image_versions2?: {
    candidates?: {
      url: string;
      width?: number;
      height?: number;
    }[];
  };

  like_count?: number;
  comment_count?: number;

  caption?: {
    text?: string;
  } | null;

  taken_at?: number;

  location?: {
    name?: string;
  } | null;

  code?: string;

  carousel_media?: {
    display_uri?: string;
    image_versions2?: {
      candidates?: {
        url: string;
        width?: number;
        height?: number;
      }[];
    };
  }[];
};

export default function InstagramPage() {
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Engagement calculations
  // --------------------------------------------------

  const totalLikes = media.reduce(
    (sum, item) => sum + (item.like_count ?? 0),
    0
  );

  const totalComments = media.reduce(
    (sum, item) => sum + (item.comment_count ?? 0),
    0
  );

  const totalEngagements = totalLikes + totalComments;

  const averageLikes = media.length
    ? totalLikes / media.length
    : 0;

  const averageComments = media.length
    ? totalComments / media.length
    : 0;

  const averageEngagement = media.length
    ? totalEngagements / media.length
    : 0;

  const performancePosts = [...media].sort(
    (a, b) =>
      (b.like_count ?? 0) +
      (b.comment_count ?? 0) -
      ((a.like_count ?? 0) + (a.comment_count ?? 0))
  );

  // --------------------------------------------------
  // Search Instagram creator
  // --------------------------------------------------

  const handleSearch = async () => {
    if (!userId.trim()) {
      setError("Please enter an Instagram user ID");
      return;
    }

    const numericUserId = Number(userId);

    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
      setError("Please enter a valid Instagram user ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [userResult, relatedResult, mediaResult] =
        await Promise.all([
          getUserInfo(numericUserId),
          getRelatedProfiles(numericUserId),
          getMediaList(numericUserId, 12),
        ]);

      setUserInfo(userResult);

      const edges =
        relatedResult?.data?.user?.edge_related_profiles?.edges ?? [];

      const profileData = edges.map(
        (edge: { node: Profile }) => edge.node
      );

      setProfiles(profileData);
      setMedia(mediaResult?.items ?? []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load Instagram creator information"
      );

      setUserInfo(null);
      setProfiles([]);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==================================================
          Header
      ================================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50">
              <Instagram className="h-6 w-6 text-pink-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Instagram Analytics
              </h1>

              <p className="text-sm text-gray-500">
                Discover related Instagram creators and profiles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          Search Card
      ================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">
            Discover creators
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter an Instagram user ID to find related profiles.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
  type="number"
  value={userId}
  onChange={(e) => setUserId(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }}
  placeholder="Enter Instagram user ID"
  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
/>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* ==================================================
          Creator Information
      ================================================== */}
      {userInfo && !loading && (
        <div className="space-y-5">
          {/* Creator Profile */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                {userInfo.profile_pic_url ? (
                  <img
                    src={userInfo.profile_pic_url}
                    alt={userInfo.username}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-pink-50"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-50 text-2xl font-bold text-pink-600">
                    {(userInfo.username?.[0] || "?").toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {userInfo.full_name || userInfo.username}
                    </h2>

                    {userInfo.is_verified && (
                      <BadgeCheck className="h-5 w-5 text-blue-500" />
                    )}
                  </div>

                  <p className="text-sm text-gray-500">
                    @{userInfo.username}
                  </p>

                  {userInfo.is_professional_account && (
                    <span className="mt-2 inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-600">
                      Professional Account
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 md:text-right">
                <p className="text-sm text-gray-500">
                  Instagram ID
                </p>

                <p className="font-mono text-sm text-gray-700">
                  {userInfo.id}
                </p>
              </div>
            </div>

            {userInfo.biography && (
              <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-6 text-gray-600">
                {userInfo.biography}
              </p>
            )}
          </div>

          {/* ==================================================
              Metrics
          ================================================== */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Followers
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {userInfo.edge_followed_by?.count?.toLocaleString() ??
                  "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Following
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {userInfo.edge_follow?.count?.toLocaleString() ??
                  "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Account type
              </p>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {userInfo.is_business_account
                  ? "Business"
                  : userInfo.is_professional_account
                    ? "Professional"
                    : "Personal"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {userInfo.is_private ? "Private" : "Public"}
              </p>
            </div>
          </div>

          {/* ==================================================
              Engagement Overview
          ================================================== */}
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Engagement Overview
              </h2>

              <p className="text-sm text-gray-500">
                Based on the latest {media.length} fetched posts
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Total Likes */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Likes
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalLikes.toLocaleString()}
                </p>
              </div>

              {/* Total Comments */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Comments
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {totalComments.toLocaleString()}
                </p>
              </div>

              {/* Average Likes */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Avg Likes / Post
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {averageLikes.toFixed(1)}
                </p>
              </div>

              {/* Average Comments */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Avg Comments / Post
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {averageComments.toFixed(1)}
                </p>
              </div>

              {/* Average Engagement */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Avg Engagement / Post
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {averageEngagement.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              Content Performance
          ================================================== */}
          {media.length > 0 && (
            <div className="mt-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Content Performance
                </h2>

                <p className="text-sm text-gray-500">
                  Posts ranked by likes and comments
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Rank
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Content
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Likes
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Comments
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Engagement
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {performancePosts.map((item, index) => {
                        const engagement =
                          (item.like_count ?? 0) +
                          (item.comment_count ?? 0);

                        const caption =
                          item.caption?.text?.trim() ||
                          "No caption";

                        const image =
                          item.image_versions2?.candidates?.[0]?.url ||
                          item.display_uri ||
                          item.carousel_media?.[0]
                            ?.image_versions2?.candidates?.[0]?.url ||
                          "";

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-gray-50"
                          >
                            {/* Rank */}
                            <td className="px-5 py-4">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-sm font-bold text-pink-600">
                                {index + 1}
                              </span>
                            </td>

                            {/* Content */}
                            <td className="min-w-[260px] px-5 py-4">
                              <div className="flex items-center gap-3">
                                {image ? (
                                  <img
                                    src={image}
                                    alt=""
                                    className="h-12 w-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-gray-100" />
                                )}

                                <div className="min-w-0">
                                  <p className="line-clamp-2 text-sm font-medium text-gray-900">
                                    {caption}
                                  </p>

                                  {item.code && (
                                    <a
                                      href={`https://www.instagram.com/p/${item.code}/`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-1 inline-block text-xs font-medium text-pink-600 hover:text-pink-700"
                                    >
                                      View post
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Likes */}
                            <td className="px-5 py-4">
                              <span className="font-semibold text-gray-900">
                                {(item.like_count ?? 0).toLocaleString()}
                              </span>
                            </td>

                            {/* Comments */}
                            <td className="px-5 py-4">
                              <span className="font-semibold text-gray-900">
                                {(item.comment_count ?? 0).toLocaleString()}
                              </span>
                            </td>

                            {/* Engagement */}
                            <td className="px-5 py-4">
                              <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-600">
                                {engagement.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              Recent Content
          ================================================== */}
          {media.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Content
                  </h2>

                  <p className="text-sm text-gray-500">
                    Latest posts and content from @
                    {userInfo.username}
                  </p>
                </div>

                <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600">
                  {media.length} posts
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {media.map((item) => {
                  const image =
                    item.image_versions2?.candidates?.[0]?.url ||
                    item.display_uri ||
                    item.carousel_media?.[0]?.image_versions2
                      ?.candidates?.[0]?.url ||
                    "";

                  const caption =
                    item.caption?.text?.trim() || "No caption";

                  const date = item.taken_at
                    ? new Date(
                        item.taken_at * 1000
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Unknown date";

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        {image ? (
                          <img
                            src={image}
                            alt={caption.slice(0, 80)}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No image available
                          </div>
                        )}

                        {item.product_type ===
                          "carousel_container" && (
                          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
                            Carousel
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{date}</span>

                          {item.location?.name && (
                            <span className="max-w-[150px] truncate">
                              {item.location.name}
                            </span>
                          )}
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {caption}
                        </p>

                        {/* Engagement */}
                        <div className="mt-4 flex items-center gap-5 border-t border-gray-100 pt-4">
                          <div>
                            <p className="text-xs text-gray-400">
                              Likes
                            </p>

                            <p className="font-semibold text-gray-900">
                              {item.like_count?.toLocaleString() ??
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">
                              Comments
                            </p>

                            <p className="font-semibold text-gray-900">
                              {item.comment_count?.toLocaleString() ??
                                "—"}
                            </p>
                          </div>

                          {item.code && (
                            <a
                              href={`https://www.instagram.com/p/${item.code}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-auto text-sm font-medium text-pink-600 hover:text-pink-700"
                            >
                              View post
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          Results Summary
      ================================================== */}
      {profiles.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Related creators
            </h2>

            <p className="text-sm text-gray-500">
              {profiles.length} profiles found
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            {profiles.length}
          </div>
        </div>
      )}

      {/* ==================================================
          Loading State
      ================================================== */}
      {loading && (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" />

            <p className="text-sm">
              Finding related Instagram profiles...
            </p>
          </div>
        </div>
      )}

      {/* ==================================================
          Empty State
      ================================================== */}
      {!loading && profiles.length === 0 && !error && (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
            <Instagram className="h-7 w-7 text-pink-500" />
          </div>

          <h3 className="font-semibold text-gray-900">
            No profiles yet
          </h3>

          <p className="mt-1 max-w-md text-sm text-gray-500">
            Enter an Instagram user ID above to discover related
            creators.
          </p>
        </div>
      )}

      {/* ==================================================
          Profile Grid
      ================================================== */}
      {!loading && profiles.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profile.profile_pic_url ? (
                    <img
                      src={profile.profile_pic_url}
                      alt={profile.username}
                      className="h-16 w-16 rounded-full object-cover ring-4 ring-gray-50"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-500">
                      {(profile.username?.[0] || "?").toUpperCase()}
                    </div>
                  )}

                  {profile.is_verified && (
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-white">
                      <BadgeCheck className="h-5 w-5 fill-blue-500 text-white" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900">
                    {profile.full_name || profile.username}
                  </h3>

                  <p className="truncate text-sm text-gray-500">
                    @{profile.username}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}

                {profile.is_private ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    <Lock className="h-3.5 w-3.5" />
                    Private
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                    <Globe className="h-3.5 w-3.5" />
                    Public
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400">
                  Instagram ID
                </p>

                <p className="mt-1 font-mono text-xs text-gray-600">
                  {profile.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}