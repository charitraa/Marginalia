/**
 * Series: an ordered run of posts, like "Web Hacking, part 3 of 7".
 *
 * Order is a real column on each entry rather than an accident of insertion,
 * so a series can be rearranged without rewriting its posts.
 */

import type { Post } from "@/features/posts/types";
import type { Author } from "@/features/users/types";

export interface SeriesEntry {
  id: string;
  position: number;
  post: Post;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  author: Author;
  isPublished: boolean;
  postCount: number;
  /** How many parts the signed-in reader has finished. 0 for guests. */
  completedCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SeriesDetail extends Series {
  entries: SeriesEntry[];
  completedPostIds: string[];
  /** First unfinished part — where "continue" goes. Null once finished. */
  nextPostSlug: string | null;
}

export interface SeriesInput {
  title: string;
  description: string;
  isPublished: boolean;
  coverImage?: File | null;
}
