import type {
  Author,
  Category,
  Comment,
  CurrentUser,
  Paginated,
  Post,
  PostStatus,
  Tag,
} from "@/types/blog";
import { mediaUrl } from "@/lib/format";

/**
 * Maps the API's snake_case payloads onto the camelCase domain types in
 * src/types/blog.ts, so no component ever reads a raw API field name.
 *
 * Counters the API does not send stay null rather than becoming 0: the UI hides
 * the affordance instead of showing a number that isn't real.
 */

type Raw = Record<string, any>;

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function count(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export function normalizeAuthor(raw: Raw | null | undefined): Author {
  if (!raw) {
    return {
      id: "",
      username: "",
      name: "Unknown author",
      avatar: null,
      headline: "",
      bio: "",
      joinedAt: null,
      postCount: null,
      followerCount: null,
      followingCount: null,
      totalLikes: null,
      isFollowing: false,
      website: "",
      twitter: "",
      github: "",
      linkedin: "",
    };
  }

  return {
    id: String(raw.id ?? ""),
    username: text(raw.username),
    name: text(raw.name) || text(raw.username) || "Unknown author",
    avatar: mediaUrl(raw.avatar ?? null),
    headline: text(raw.headline),
    bio: text(raw.bio),
    joinedAt: raw.date_joined ?? null,
    postCount: count(raw.post_count),
    followerCount: count(raw.follower_count),
    followingCount: count(raw.following_count),
    totalLikes: count(raw.total_likes),
    isFollowing: Boolean(raw.is_following),
    website: text(raw.website),
    twitter: text(raw.twitter),
    github: text(raw.github),
    linkedin: text(raw.linkedin),
  };
}

export function normalizeCategory(raw: Raw | null | undefined): Category | null {
  if (!raw?.name) return null;
  return {
    id: String(raw.id ?? ""),
    name: raw.name,
    slug: text(raw.slug),
    description: text(raw.description),
    count: count(raw.post_count),
  };
}

export function normalizeTag(raw: Raw | null | undefined): Tag | null {
  if (!raw?.name) return null;
  return { id: String(raw.id ?? ""), name: raw.name, slug: text(raw.slug), count: count(raw.post_count) };
}

export function normalizePost(raw: Raw): Post {
  const status: PostStatus = raw.status === "draft" ? "draft" : "published";

  return {
    id: String(raw.id ?? ""),
    slug: text(raw.slug) || String(raw.id ?? ""),
    title: text(raw.title, "Untitled"),
    excerpt: text(raw.excerpt),
    // Only detail responses carry the body; list responses omit it by design.
    content: text(raw.content),
    coverImage: mediaUrl(raw.cover_image ?? null),
    author: normalizeAuthor(raw.author),
    category: normalizeCategory(raw.category),
    tags: Array.isArray(raw.tags)
      ? raw.tags.map(normalizeTag).filter((tag): tag is Tag => Boolean(tag))
      : [],
    status,
    publishedAt: raw.published_at ?? null,
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    readingTime: typeof raw.reading_time === "number" ? raw.reading_time : 1,
    likeCount: count(raw.like_count),
    commentCount: count(raw.comment_count),
    viewCount: count(raw.view_count),
    isLiked: Boolean(raw.is_liked),
  };
}

export function normalizeComment(raw: Raw): Comment {
  return {
    id: String(raw.id ?? ""),
    content: text(raw.content),
    author: normalizeAuthor(raw.author),
    parentId: raw.parent ? String(raw.parent) : null,
    isEdited: Boolean(raw.is_edited),
    canEdit: Boolean(raw.can_edit),
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    replies: Array.isArray(raw.replies) ? raw.replies.map(normalizeComment) : [],
  };
}

export function normalizeCurrentUser(raw: Raw): CurrentUser {
  return {
    ...normalizeAuthor(raw),
    email: text(raw.email),
    firstName: text(raw.first_name),
    lastName: text(raw.last_name),
    city: text(raw.city),
    district: text(raw.district),
    isVerified: Boolean(raw.is_verified),
    isStaff: Boolean(raw.is_staff),
  };
}

/** Accepts DRF's {count, next, previous, results} envelope, or a plain array. */
export function normalizePage<T>(
  raw: any,
  map: (item: Raw) => T,
  requestedPage = 1,
  requestedPageSize?: number,
): Paginated<T> {
  if (Array.isArray(raw)) {
    return {
      items: raw.map(map),
      count: raw.length,
      page: 1,
      pageSize: requestedPageSize ?? raw.length,
      hasNext: false,
      hasPrevious: false,
    };
  }

  const results = Array.isArray(raw?.results) ? raw.results : [];
  const items = results.map(map);
  const pageSize = requestedPageSize ?? items.length;
  return {
    items,
    count: typeof raw?.count === "number" ? raw.count : items.length,
    page: requestedPage,
    pageSize,
    hasNext: Boolean(raw?.next),
    hasPrevious: Boolean(raw?.previous),
  };
}

/** Total pages for a paginated response, for the page-number control. */
export function pageCount(page: Paginated<unknown>): number {
  if (!page.pageSize) return 1;
  return Math.max(1, Math.ceil(page.count / page.pageSize));
}
