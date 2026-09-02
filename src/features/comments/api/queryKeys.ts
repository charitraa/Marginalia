import type { CommentSort } from "../types";

export const commentKeys = {
  all: ["comments"] as const,
  forPost: (postId: string, sort: CommentSort = "newest") =>
    ["comments", postId, sort] as const,
};
