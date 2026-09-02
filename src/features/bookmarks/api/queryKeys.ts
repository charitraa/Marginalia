import type { PostQuery } from "@/features/posts/types";

export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  list: (query: PostQuery) => ["bookmarks", "list", query] as const,
};
