import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as commentService from "../api/commentService";
import { commentKeys } from "../api/queryKeys";
import { postKeys } from "@/features/posts/api/queryKeys";
import { errorMessage } from "@/lib/errors";
import type { CommentSort } from "../types";

export function useComments(postId: string | undefined, sort: CommentSort = "newest") {
  return useQuery({
    queryKey: commentKeys.forPost(postId ?? "", sort),
    queryFn: () => commentService.listComments(postId as string, sort),
    enabled: Boolean(postId),
    // Keeps the thread on screen while re-sorting instead of flashing empty.
    placeholderData: (previous) => previous,
  });
}

export function useCommentMutations(postId: string) {
  const queryClient = useQueryClient();
  // The post detail carries commentCount, so it goes stale alongside the thread.
  const invalidate = () => {
    // Every sort of this post's thread, not just the one on screen.
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
  };

  const create = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      commentService.createComment(postId, content, parentId),
    onSuccess: () => {
      toast.success("Comment added.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Unable to post your comment.")),
  });

  const update = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentService.updateComment(id, content),
    onSuccess: () => {
      toast.success("Comment updated.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Unable to update your comment.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => commentService.deleteComment(id),
    onSuccess: () => {
      toast.success("Comment deleted.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Unable to delete your comment.")),
  });

  return { create, update, remove };
}

/**
 * Liking a comment.
 *
 * Optimistic: the heart flips immediately and rolls back if the request fails,
 * because a like should feel instant even on a slow connection.
 */
export function useCommentLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      commentService.setCommentLike(id, liked),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not register that like.")),
  });
}

export function useCommentPin(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      commentService.setCommentPin(id, pinned),
    onSuccess: (_comment, { pinned }) => {
      toast.success(pinned ? "Comment pinned to the top." : "Comment unpinned.");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not pin that comment.")),
  });
}
