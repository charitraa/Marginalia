/**
 * Domain types the UI renders. Raw API payloads are mapped onto these in
 * src/services/normalizers.ts, so components never read an API field name.
 *
 * Fields typed `| null` are counters the API may omit. The UI hides the matching
 * affordance when the value is null rather than displaying a number that is not real.
 */

export interface Author {
  id: string;
  username: string;
  /** Full name, falling back to the username. Never empty. */
  name: string;
  avatar: string | null;
  headline: string;
  bio: string;
  joinedAt: string | null;
  postCount: number | null;
  followerCount: number | null;
  followingCount: number | null;
  totalLikes: number | null;
  isFollowing: boolean;
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
}

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
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  parentId: string | null;
  isEdited: boolean;
  /** Server's view of whether the current user may edit. UX only — the API re-checks. */
  canEdit: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  replies: Comment[];
}

export interface Paginated<T> {
  items: T[];
  count: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CurrentUser extends Author {
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  district: string;
  isVerified: boolean;
  isStaff: boolean;
}

export interface DashboardStats {
  totalPosts: number | null;
  publishedPosts: number | null;
  draftPosts: number | null;
  totalLikes: number | null;
  totalComments: number | null;
  totalViews: number | null;
  followerCount: number | null;
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
