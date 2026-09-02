import type { Post } from "@/features/posts/types";

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

/**
 * A category's own page, which carries its description and a follow button.
 * `/explore?category=` still works as a plain filtered list.
 */
export function categoryPath(slug: string): string {
  return `/category/${encodeURIComponent(slug)}`;
}

export function tagPath(slug: string): string {
  return `/explore?tag=${encodeURIComponent(slug)}`;
}
