import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as commentService from "../api/commentService";
import { commentKeys } from "../api/queryKeys";
import { postKeys } from "@/features/posts/api/queryKeys";
import { errorMessage } from "@/lib/errors";

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: commentKeys.forPost(postId ?? ""),
    queryFn: () => commentService.listComments(postId as string),
    enabled: Boolean(postId),
  });
}

export function useCommentMutations(postId: string) {
  const queryClient = useQueryClient();
  // The post detail carries commentCount, so it goes stale alongside the thread.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: commentKeys.forPost(postId) });
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
