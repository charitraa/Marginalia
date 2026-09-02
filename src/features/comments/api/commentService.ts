import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import { normalizeComment } from "./normalizers";
import type { Comment, ReportReason } from "@/features/comments/types";

/**
 * Comments for a post.
 *
 * Only top-level comments are paginated; the API nests each thread's replies
 * inside its parent, so one request renders the whole discussion.
 */
export async function listComments(postIdOrSlug: string): Promise<Comment[]> {
  const { data } = await axiosInstance.get(`/api/posts/${postIdOrSlug}/comments/`, {
    params: { page_size: 100 },
  });
  return normalizePage(data, normalizeComment).items;
}

export async function createComment(
  postIdOrSlug: string,
  content: string,
  parentId?: string,
): Promise<Comment> {
  const body: Record<string, unknown> = { content };
  if (parentId) body.parent = parentId;
  const { data } = await axiosInstance.post(`/api/posts/${postIdOrSlug}/comments/`, body);
  return normalizeComment(data);
}

export async function updateComment(commentId: string, content: string): Promise<Comment> {
  const { data } = await axiosInstance.patch(`/api/comments/${commentId}/`, { content });
  return normalizeComment(data);
}

export async function deleteComment(commentId: string): Promise<void> {
  await axiosInstance.delete(`/api/comments/${commentId}/`);
}

/**
 * Flags a comment for a moderator.
 *
 * Reporting never hides anything on its own — a moderator decides — so the UI
 * thanks the reporter rather than implying the comment has been removed.
 */
export async function reportComment(
  commentId: string,
  reason: ReportReason,
  detail = "",
): Promise<void> {
  await axiosInstance.post(`/api/comments/${commentId}/report/`, { reason, detail });
}
