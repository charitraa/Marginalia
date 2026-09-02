import { text, type Raw } from "@/lib/api/normalize";
import { normalizeAuthor } from "@/features/users/api/normalizers";
import type { Comment } from "../types";

export function normalizeComment(raw: Raw): Comment {
  return {
    id: String(raw.id ?? ""),
    content: text(raw.content),
    author: normalizeAuthor(raw.author),
    parentId: raw.parent ? String(raw.parent) : null,
    postId: raw.post ? String(raw.post) : "",
    isEdited: Boolean(raw.is_edited),
    canEdit: Boolean(raw.can_edit),
    canPin: Boolean(raw.can_pin),
    isPinned: Boolean(raw.is_pinned),
    likeCount: typeof raw.like_count === "number" ? raw.like_count : 0,
    isLiked: Boolean(raw.is_liked),
    isHidden: Boolean(raw.is_hidden),
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    replies: Array.isArray(raw.replies) ? raw.replies.map(normalizeComment) : [],
  };
}
