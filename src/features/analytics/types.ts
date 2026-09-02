/**
 * Author-facing analytics.
 *
 * Everything is derived from data the site already records. There are no
 * referrer, country or device breakdowns because the server has never collected
 * those — a dashboard is not a reason to start profiling readers.
 */

export interface DailyCount {
  date: string;
  count: number;
}

export interface TopPost {
  slug: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
}

export interface PostAnalytics {
  slug: string;
  title: string;
  publishedAt: string | null;
  totalViews: number;
  uniqueViewers: number;
  viewsInPeriod: number;
  likes: number;
  bookmarks: number;
  comments: number;
  readers: number;
  finishedReaders: number;
  /** Mean scroll depth across everyone who opened it, 0-100. */
  averageProgress: number;
  /** Share of readers who reached the end, 0-100. */
  completionRate: number;
  readingTime: number;
  dailyViews: DailyCount[];
}

export interface AuthorAnalytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalViews: number;
  uniqueViewers: number;
  viewsInPeriod: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  followers: number;
  dailyViews: DailyCount[];
  topPosts: TopPost[];
}
