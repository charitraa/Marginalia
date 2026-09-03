import type { Post } from "@/features/posts/types";
import type { CurrentUser } from "@/features/users/types";

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

/**
 * Where a sign-in lands when the visitor was not already headed somewhere.
 *
 * Someone who moderates the publication is here to run it, so they open the
 * admin dashboard; their own writing dashboard is still one click away in the
 * header. `canModerate` is the same capability that guards `/admin`, so this
 * can never send anyone to a page they would be bounced off.
 */
export function landingPath(user: CurrentUser | null | undefined): string {
  return user?.canModerate ? "/admin" : "/dashboard";
}
