import type { Post } from "@/types/blog";

/**
 * Post URLs.
 *
 * Every post has a unique slug, and the API also resolves a raw UUID on the same
 * route, so an old id-based link keeps working.
 */
export function postPath(post: Pick<Post, "id" | "slug">): string {
  return `/post/${post.slug || post.id}`;
}

export function authorPath(author: { id: string; username?: string }): string {
  return `/author/${encodeURIComponent(author.username || author.id)}`;
}

export function categoryPath(slug: string): string {
  return `/explore?category=${encodeURIComponent(slug)}`;
}

export function tagPath(slug: string): string {
  return `/explore?tag=${encodeURIComponent(slug)}`;
}
