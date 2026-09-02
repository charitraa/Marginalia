import { axiosInstance } from "@/lib/api/client";
import type { AuthorAnalytics, DailyCount, PostAnalytics, TopPost } from "../types";

type Raw = Record<string, any>;

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function days(raw: unknown): DailyCount[] {
  return Array.isArray(raw)
    ? raw.map((entry) => ({ date: String(entry.date), count: num(entry.count) }))
    : [];
}

function normalizeAuthorAnalytics(raw: Raw): AuthorAnalytics {
  return {
    totalPosts: num(raw.total_posts),
    publishedPosts: num(raw.published_posts),
    draftPosts: num(raw.draft_posts),
    scheduledPosts: num(raw.scheduled_posts),
    totalViews: num(raw.total_views),
    uniqueViewers: num(raw.unique_viewers),
    viewsInPeriod: num(raw.views_in_period),
    totalLikes: num(raw.total_likes),
    totalComments: num(raw.total_comments),
    totalBookmarks: num(raw.total_bookmarks),
    followers: num(raw.followers),
    dailyViews: days(raw.daily_views),
    topPosts: Array.isArray(raw.top_posts)
      ? raw.top_posts.map(
          (entry: Raw): TopPost => ({
            slug: String(entry.slug ?? ""),
            title: String(entry.title ?? ""),
            views: num(entry.views),
            likes: num(entry.likes),
            comments: num(entry.comments),
          }),
        )
      : [],
  };
}

function normalizePostAnalytics(raw: Raw): PostAnalytics {
  return {
    slug: String(raw.slug ?? ""),
    title: String(raw.title ?? ""),
    publishedAt: raw.published_at ?? null,
    totalViews: num(raw.total_views),
    uniqueViewers: num(raw.unique_viewers),
    viewsInPeriod: num(raw.views_in_period),
    likes: num(raw.likes),
    bookmarks: num(raw.bookmarks),
    comments: num(raw.comments),
    readers: num(raw.readers),
    finishedReaders: num(raw.finished_readers),
    averageProgress: num(raw.average_progress),
    completionRate: num(raw.completion_rate),
    readingTime: num(raw.reading_time),
    dailyViews: days(raw.daily_views),
  };
}

export async function getAuthorAnalytics(period = 30): Promise<AuthorAnalytics> {
  const { data } = await axiosInstance.get("/api/users/me/analytics/", {
    params: { days: period },
  });
  return normalizeAuthorAnalytics(data);
}

export async function getPostAnalytics(slug: string, period = 30): Promise<PostAnalytics> {
  const { data } = await axiosInstance.get(`/api/posts/${slug}/analytics/`, {
    params: { days: period },
  });
  return normalizePostAnalytics(data);
}
