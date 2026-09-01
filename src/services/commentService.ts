import { axiosInstance } from "./ApiClients";
import { normalizeComment, normalizePage } from "./normalizers";
import type { Comment } from "@/types/blog";

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
