import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import {
  normalizeCategory,
  normalizePost,
  normalizePostRevision,
  normalizePostRevisionDetail,
  normalizeReadingHistoryEntry,
  normalizeTag,
} from "./normalizers";
import type {
  Category,
  Post,
  PostInput,
  PostQuery,
  PostRevision,
  PostRevisionDetail,
  ReadingHistoryEntry,
  Tag,
} from "@/features/posts/types";
import type { Paginated } from "@/types/common";
import { POSTS_PER_PAGE } from "@/config/constants";

/** UI sort value -> the `ordering` values the API allows. */
const ORDERING: Record<string, string> = {
  latest: "-published_at",
  oldest: "published_at",
  popular: "-like_count",
  discussed: "-comment_count",
  viewed: "-view_count",
};

function toParams(query: PostQuery = {}) {
  const params: Record<string, string | number> = {};
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.category && query.category !== "all") params.category = query.category;
  if (query.tag) params.tag = query.tag;
  if (query.author) params.author = query.author;
  if (query.status) params.status = query.status;
  if (query.ordering) params.ordering = ORDERING[query.ordering] ?? query.ordering;
  params.page = query.page ?? 1;
  params.page_size = query.pageSize ?? POSTS_PER_PAGE;
  return params;
}

export async function listPosts(query: PostQuery = {}): Promise<Paginated<Post>> {
  const { data } = await axiosInstance.get("/api/posts/", { params: toParams(query) });
  return normalizePage(data, normalizePost, query.page ?? 1, query.pageSize ?? POSTS_PER_PAGE);
}

/** Ranked by real engagement on the server; `days` widens the window. */
export async function listTrendingPosts(
  query: PostQuery & { days?: number } = {},
): Promise<Paginated<Post>> {
  const params = { ...toParams(query), ...(query.days ? { days: query.days } : {}) };
  const { data } = await axiosInstance.get("/api/posts/trending/", { params });
  return normalizePage(data, normalizePost, query.page ?? 1, query.pageSize ?? POSTS_PER_PAGE);
}

export async function getPost(idOrSlug: string): Promise<Post> {
  const { data } = await axiosInstance.get(`/api/posts/${idOrSlug}/`);
  return normalizePost(data);
}

export async function listRelatedPosts(idOrSlug: string): Promise<Post[]> {
  const { data } = await axiosInstance.get(`/api/posts/${idOrSlug}/related/`);
  return (Array.isArray(data) ? data : (data?.results ?? [])).map(normalizePost);
}

/**
 * A cover image forces multipart; without one a plain JSON body keeps arrays
 * (tags) properly typed instead of flattening them to strings.
 */
function toPayload(input: PostInput, options: { includeCover?: boolean } = {}) {
  const base: Record<string, unknown> = {
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    status: input.status,
  };
  if (input.category) base.category = input.category;
  if (input.subtitle !== undefined) base.subtitle = input.subtitle;
  if (input.visibility) base.visibility = input.visibility;
  // Only meaningful for a scheduled post; sending null clears a previous date.
  if (input.scheduledFor !== undefined) base.scheduled_for = input.scheduledFor;
  if (input.seoTitle !== undefined) base.seo_title = input.seoTitle;
  if (input.seoDescription !== undefined) base.seo_description = input.seoDescription;
  if (input.canonicalUrl !== undefined) base.canonical_url = input.canonicalUrl;

  if (input.coverImage instanceof File && options.includeCover !== false) {
    const form = new FormData();
    Object.entries(base).forEach(([key, value]) => form.append(key, String(value)));
    input.tags.forEach((tag) => form.append("tags", tag));
    form.append("cover_image", input.coverImage);
    return form;
  }

  return { ...base, tags: input.tags };
}

export async function createPost(input: PostInput): Promise<Post> {
  const { data } = await axiosInstance.post("/api/posts/", toPayload(input));
  return normalizePost(data);
}

/** Omitting the cover on an update leaves the stored image untouched. */
export async function updatePost(idOrSlug: string, input: PostInput): Promise<Post> {
  const { data } = await axiosInstance.patch(`/api/posts/${idOrSlug}/`, toPayload(input));
  return normalizePost(data);
}

export async function deletePost(idOrSlug: string): Promise<void> {
  await axiosInstance.delete(`/api/posts/${idOrSlug}/`);
}

export interface LikeResult {
  isLiked: boolean;
  likeCount: number | null;
}

export async function setLike(idOrSlug: string, liked: boolean): Promise<LikeResult> {
  const path = `/api/posts/${idOrSlug}/like/`;
  const { data } = liked ? await axiosInstance.post(path) : await axiosInstance.delete(path);
  return {
    isLiked: data?.is_liked ?? liked,
    likeCount: typeof data?.like_count === "number" ? data.like_count : null,
  };
}

/** Categories are a small fixed set, so the API returns them unpaginated. */
export async function listCategories(): Promise<Category[]> {
  const { data } = await axiosInstance.get("/api/categories/");
  const list = Array.isArray(data) ? data : (data?.results ?? []);
  return list.map(normalizeCategory).filter((entry): entry is Category => Boolean(entry));
}

export async function listTags(): Promise<Tag[]> {
  const { data } = await axiosInstance.get("/api/tags/", { params: { page_size: 40 } });
  const list = Array.isArray(data) ? data : (data?.results ?? []);
  return list.map(normalizeTag).filter((entry): entry is Tag => Boolean(entry));
}

/** Published posts by one author. Their drafts are never included here. */
export async function listPostsByAuthor(
  username: string,
  query: PostQuery = {},
): Promise<Paginated<Post>> {
  const { data } = await axiosInstance.get(`/api/users/${username}/posts/`, {
    params: toParams(query),
  });
  return normalizePage(data, normalizePost, query.page ?? 1, query.pageSize ?? POSTS_PER_PAGE);
}

/** The signed-in author's own posts, drafts included. */
export async function listMyPosts(query: PostQuery = {}): Promise<Paginated<Post>> {
  const { data } = await axiosInstance.get("/api/posts/mine/", { params: toParams(query) });
  return normalizePage(data, normalizePost, query.page ?? 1, query.pageSize ?? POSTS_PER_PAGE);
}

export async function setBookmark(idOrSlug: string, bookmarked: boolean): Promise<boolean> {
  const path = `/api/posts/${idOrSlug}/bookmark/`;
  const { data } = bookmarked ? await axiosInstance.post(path) : await axiosInstance.delete(path);
  return typeof data?.is_bookmarked === "boolean" ? data.is_bookmarked : bookmarked;
}

/** The reader's saved posts, newest save first. */
export async function listBookmarks(query: PostQuery = {}): Promise<Paginated<Post>> {
  const { data } = await axiosInstance.get("/api/bookmarks/", { params: toParams(query) });
  return normalizePage(data, normalizePost, query.page ?? 1, query.pageSize ?? POSTS_PER_PAGE);
}

/**
 * Reads an unpublished draft with its share token instead of a session, so a
 * reviewer can open the link without an account.
 */
export async function getPostPreview(slug: string, token: string): Promise<Post> {
  const { data } = await axiosInstance.get(`/api/posts/${slug}/preview/`, { params: { token } });
  return normalizePost(data);
}

/** Issues a new preview token, which revokes every link shared so far. */
export async function rotatePreviewToken(slug: string): Promise<Post> {
  const { data } = await axiosInstance.post(`/api/posts/${slug}/preview-token/`);
  return normalizePost(data);
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

type LifecycleAction = "archive" | "unarchive" | "restore" | "duplicate";

/** Archive, unarchive, restore from trash, or copy into a new draft. */
export async function runLifecycleAction(
  slug: string,
  action: LifecycleAction,
): Promise<Post> {
  const { data } = await axiosInstance.post(`/api/posts/${slug}/${action}/`);
  return normalizePost(data);
}

/** The author's soft-deleted posts. Deleting is reversible, so this is a trash can. */
export async function listTrash(page = 1): Promise<Paginated<Post>> {
  const { data } = await axiosInstance.get("/api/posts/trash/", { params: { page } });
  return normalizePage(data, normalizePost, page, POSTS_PER_PAGE);
}

export async function listRevisions(slug: string, page = 1): Promise<Paginated<PostRevision>> {
  const { data } = await axiosInstance.get(`/api/posts/${slug}/revisions/`, { params: { page } });
  return normalizePage(data, normalizePostRevision, page, 10);
}

export async function getRevision(slug: string, id: string): Promise<PostRevisionDetail> {
  const { data } = await axiosInstance.get(`/api/posts/${slug}/revisions/${id}/`);
  return normalizePostRevisionDetail(data);
}

/** Puts a revision's text back. What was there is snapshotted first. */
export async function restoreRevision(slug: string, id: string): Promise<Post> {
  const { data } = await axiosInstance.post(`/api/posts/${slug}/revisions/${id}/`);
  return normalizePost(data);
}

/* ------------------------------------------------------------------ */
/* Reading history                                                     */
/* ------------------------------------------------------------------ */

/**
 * Records how far down the article the reader has got.
 *
 * Called while scrolling, so failures are swallowed: losing a scroll position
 * is not worth an error in the reader's face.
 */
export async function recordProgress(slug: string, progress: number): Promise<void> {
  try {
    await axiosInstance.post(`/api/posts/${slug}/progress/`, { progress });
  } catch {
    /* best effort */
  }
}

export async function listReadingHistory(
  options: { unfinishedOnly?: boolean; page?: number } = {},
): Promise<Paginated<ReadingHistoryEntry>> {
  const params: Record<string, string | number> = { page: options.page ?? 1 };
  if (options.unfinishedOnly) params.unfinished = "true";

  const { data } = await axiosInstance.get("/api/reading-history/", { params });
  return normalizePage(data, normalizeReadingHistoryEntry, options.page ?? 1, 10);
}

export async function clearReadingHistory(postSlug?: string): Promise<void> {
  await axiosInstance.delete("/api/reading-history/clear/", {
    params: postSlug ? { post: postSlug } : undefined,
  });
}

/** Posts from the authors, categories and tags this reader follows. */
export async function listFeed(query: PostQuery = {}): Promise<Paginated<Post>> {
  const { data } = await axiosInstance.get("/api/posts/feed/", { params: toParams(query) });
  return normalizePage(data, normalizePost, query.page ?? 1, POSTS_PER_PAGE);
}

/** Content-based suggestions, from what this reader has liked, saved or finished. */
export async function listRecommended(page = 1): Promise<Paginated<Post>> {
  const { data } = await axiosInstance.get("/api/posts/recommended/", { params: { page } });
  return normalizePage(data, normalizePost, page, POSTS_PER_PAGE);
}
