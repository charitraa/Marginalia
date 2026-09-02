import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as postService from "../api/postService";
import { postKeys } from "../api/queryKeys";
import { userKeys } from "@/features/users/api/queryKeys";
import { errorMessage } from "@/lib/errors";
import type { Post, PostQuery } from "../types";

/** Reading and writing posts. Comment and author hooks live in their own features. */

export function usePostList(query: PostQuery, enabled = true) {
  return useQuery({
    queryKey: postKeys.list(query),
    queryFn: () => postService.listPosts(query),
    enabled,
    placeholderData: (previous) => previous, // keeps the grid visible while refiltering
    staleTime: 30_000,
  });
}

export function useTrendingPosts(query: PostQuery & { days?: number } = {}, enabled = true) {
  return useQuery({
    queryKey: postKeys.trending(query),
    queryFn: () => postService.listTrendingPosts(query),
    enabled,
    staleTime: 60_000,
  });
}

export function usePost(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: postKeys.detail(idOrSlug ?? ""),
    queryFn: () => postService.getPost(idOrSlug as string),
    enabled: Boolean(idOrSlug),
    retry: (failureCount, error: any) =>
      // A missing or forbidden post is a final answer, not a flaky request.
      ![403, 404].includes(error?.response?.status) && failureCount < 2,
  });
}

export function useRelatedPosts(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: postKeys.related(idOrSlug ?? ""),
    queryFn: () => postService.listRelatedPosts(idOrSlug as string),
    enabled: Boolean(idOrSlug),
    staleTime: 5 * 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: postKeys.categories,
    queryFn: postService.listCategories,
    staleTime: 5 * 60_000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: postKeys.tags,
    queryFn: postService.listTags,
    staleTime: 5 * 60_000,
  });
}

export function useAuthorPosts(username: string | undefined, query: PostQuery = {}) {
  return useQuery({
    queryKey: postKeys.byAuthor(username ?? "", query),
    queryFn: () => postService.listPostsByAuthor(username as string, query),
    enabled: Boolean(username),
    placeholderData: (previous) => previous,
  });
}

export function useMyPosts(query: PostQuery, enabled = true) {
  return useQuery({
    queryKey: postKeys.mine(query),
    queryFn: () => postService.listMyPosts(query),
    enabled,
    placeholderData: (previous) => previous,
  });
}

/**
 * Like toggle with an optimistic update, reconciled against the count the API
 * returns. The request is the source of truth; the UI just responds early.
 */
export function useToggleLike(post: Post | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liked: boolean) => postService.setLike(post?.slug ?? post?.id ?? "", liked),
    onMutate: async (liked) => {
      if (!post) return;
      const key = postKeys.detail(post.slug || post.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Post>(key);

      queryClient.setQueryData<Post>(key, (current) =>
        current
          ? {
              ...current,
              isLiked: liked,
              likeCount:
                current.likeCount == null
                  ? current.likeCount
                  : Math.max(0, current.likeCount + (liked ? 1 : -1)),
            }
          : current,
      );

      return { previous, key };
    },
    onError: (error, _liked, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
      toast.error(errorMessage(error, "Unable to update your like. Please try again."));
    },
    onSuccess: (result, _liked, context) => {
      if (!context?.key) return;
      queryClient.setQueryData<Post>(context.key, (current) =>
        current
          ? { ...current, isLiked: result.isLiked, likeCount: result.likeCount ?? current.likeCount }
          : current,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "list"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "trending"] });
    },
  });
}

/** Post create / update / delete, with the toasts the UX spec calls for. */
export function usePostMutations() {
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: postKeys.all });
    queryClient.invalidateQueries({ queryKey: userKeys.dashboard });
  };

  const create = useMutation({
    mutationFn: postService.createPost,
    onSuccess: (post) => {
      toast.success(post.status === "published" ? "Post published." : "Draft saved.");
      invalidateLists();
    },
    onError: (error) => toast.error(errorMessage(error, "Unable to save your post.")),
  });

  const update = useMutation({
    mutationFn: ({ idOrSlug, input }: { idOrSlug: string; input: Parameters<typeof postService.updatePost>[1] }) =>
      postService.updatePost(idOrSlug, input),
    onSuccess: (post) => {
      toast.success(post.status === "published" ? "Post updated." : "Draft saved.");
      queryClient.setQueryData(postKeys.detail(post.slug), post);
      invalidateLists();
    },
    onError: (error) => toast.error(errorMessage(error, "Unable to update your post.")),
  });

  const remove = useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      toast.success("Post deleted.");
      invalidateLists();
    },
    onError: (error) => toast.error(errorMessage(error, "Unable to delete your post.")),
  });

  return { create, update, remove };
}

/**
 * Reads a post either normally or, when a preview token is present, through the
 * draft preview endpoint. The token is what authorises the read, so a reviewer
 * following a shared link needs no account.
 */
export function usePostOrPreview(idOrSlug: string | undefined, previewToken: string | null) {
  const normal = usePost(previewToken ? undefined : idOrSlug);

  const preview = useQuery({
    queryKey: postKeys.preview(idOrSlug ?? "", previewToken ?? ""),
    queryFn: () => postService.getPostPreview(idOrSlug as string, previewToken as string),
    enabled: Boolean(idOrSlug && previewToken),
    retry: false,
  });

  return previewToken ? preview : normal;
}

export function useFeed(query: PostQuery = {}, enabled = true) {
  return useQuery({
    queryKey: ["posts", "feed", query],
    queryFn: () => postService.listFeed(query),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useRecommendedPosts(page = 1, enabled = true) {
  return useQuery({
    queryKey: ["posts", "recommended", page],
    queryFn: () => postService.listRecommended(page),
    enabled,
    placeholderData: (previous) => previous,
    // Suggestions shift only as the reader engages with more posts.
    staleTime: 5 * 60_000,
  });
}
