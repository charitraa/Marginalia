import type { PostQuery } from "../types";

/**
 * react-query keys for posts. Keys live beside the service rather than in the
 * hooks so a mutation in another feature can invalidate exactly what it changed
 * without importing a hook module.
 */
export const postKeys = {
  all: ["posts"] as const,
  list: (query: PostQuery) => ["posts", "list", query] as const,
  trending: (query: PostQuery) => ["posts", "trending", query] as const,
  detail: (idOrSlug: string) => ["posts", "detail", idOrSlug] as const,
  related: (idOrSlug: string) => ["posts", "related", idOrSlug] as const,
  mine: (query: PostQuery) => ["posts", "mine", query] as const,
  byAuthor: (author: string, query: PostQuery) => ["posts", "author", author, query] as const,
  preview: (idOrSlug: string, token: string) => ["posts", "preview", idOrSlug, token] as const,
  categories: ["categories"] as const,
  tags: ["tags"] as const,
};
