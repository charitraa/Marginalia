import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import { normalizeCategory, normalizePost, normalizeTag } from "./normalizers";
import type { Category, Post, PostInput, PostQuery, Tag } from "@/features/posts/types";
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
