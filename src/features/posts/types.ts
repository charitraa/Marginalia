/**
 * Posts and the taxonomy that files them. Raw API payloads are mapped onto these
 * in ./api/normalizers.ts, so components never read an API field name.
 */

import type { Author } from "@/features/users/types";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number | null;
}

/**
 * Where a post sits in its lifecycle.
 *
 * `scheduled` becomes readable on its own once the date passes, so a missed
 * cron tick delays the status catching up rather than the article itself.
 */
export type PostStatus = "draft" | "in_review" | "scheduled" | "published";

/** Who may open the post. */
export type PostVisibility = "public" | "members" | "private";

export interface Post {
  id: string;
  /** Readable identifier used in URLs. */
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  /** Sanitised HTML. Present on detail responses only. */
  content: string;
  coverImage: string | null;
  author: Author;
  category: Category | null;
  tags: Tag[];
  status: PostStatus;
  visibility: PostVisibility;
  publishedAt: string | null;
  /** When a scheduled post goes live. Null unless status is "scheduled". */
  scheduledFor: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isFeatured: boolean;
  isArchived: boolean;
  /** Minutes, calculated server-side so every client agrees. */
  readingTime: number;
  likeCount: number | null;
  commentCount: number | null;
  viewCount: number | null;
  isLiked: boolean;
  isBookmarked: boolean;
  /** Only present on the author's own post, for sharing an unpublished draft. */
  previewToken: string | null;
  /** SEO overrides. Blank means "derive it from the post". Author-only. */
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
}

export interface PostRevision {
  id: string;
  title: string;
  note: string;
  createdBy: Author | null;
  createdAt: string | null;
  wordCount: number;
}

export interface PostRevisionDetail extends PostRevision {
  subtitle: string;
  excerpt: string;
  content: string;
}

export interface ReadingHistoryEntry {
  id: string;
  post: Post;
  /** 0-100, written as the reader scrolls. */
  progress: number;
  isFinished: boolean;
  lastReadAt: string | null;
}

export interface PostQuery {
  search?: string;
  category?: string;
  tag?: string;
  author?: string;
  status?: PostStatus;
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export interface PostInput {
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: PostStatus;
  visibility?: PostVisibility;
  /** ISO string. Required when status is "scheduled". */
  scheduledFor?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  coverImage?: File | null;
}
