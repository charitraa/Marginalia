import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as postService from "@/services/postService";
import { postKeys } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { errorMessage } from "@/lib/errors";
import type { Post, PostQuery } from "@/types/blog";

/**
 * Saved posts.
 *
 * The toggle updates the cached post immediately and rolls back if the request
 * fails, so tapping the bookmark never leaves the icon disagreeing with the
 * server for the length of a round trip.
 */

export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  list: (query: PostQuery) => ["bookmarks", "list", query] as const,
};

export function useBookmarkList(query: PostQuery = {}) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: bookmarkKeys.list(query),
    queryFn: () => postService.listBookmarks(query),
    enabled: isAuthenticated,
    placeholderData: (previous) => previous,
  });
}

export function useToggleBookmark(post: Post) {
  const queryClient = useQueryClient();
  const detailKey = postKeys.detail(post.slug || post.id);

  return useMutation({
    mutationFn: (bookmarked: boolean) => postService.setBookmark(post.slug || post.id, bookmarked),

    onMutate: async (bookmarked) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<Post>(detailKey);
      if (previous) {
        queryClient.setQueryData<Post>(detailKey, { ...previous, isBookmarked: bookmarked });
      }
      return { previous };
    },

    onError: (error, _bookmarked, context) => {
      if (context?.previous) queryClient.setQueryData(detailKey, context.previous);
      toast.error(errorMessage(error, "Could not update your reading list."));
    },

    onSuccess: (bookmarked) => {
      toast.success(bookmarked ? "Saved to your reading list." : "Removed from your reading list.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
    },
  });
}
