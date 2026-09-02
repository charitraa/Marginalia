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

export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  /** Readable identifier used in URLs. */
  slug: string;
  title: string;
  excerpt: string;
  /** Sanitised HTML. Present on detail responses only. */
  content: string;
  coverImage: string | null;
  author: Author;
  category: Category | null;
  tags: Tag[];
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  /** Minutes, calculated server-side so every client agrees. */
  readingTime: number;
  likeCount: number | null;
  commentCount: number | null;
  viewCount: number | null;
  isLiked: boolean;
  isBookmarked: boolean;
  /** Only present on the author's own post, for sharing an unpublished draft. */
  previewToken: string | null;
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
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: PostStatus;
  coverImage?: File | null;
}
