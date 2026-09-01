import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as postService from "@/services/postService";
import * as commentService from "@/services/commentService";
import * as userService from "@/services/userService";
import { errorMessage } from "@/lib/errors";
import type { Post, PostQuery } from "@/types/blog";

/**
 * Query hooks shared by the pages. Keys live here so a mutation can invalidate
 * exactly what it changed instead of refetching the whole app.
 */
export const postKeys = {
  all: ["posts"] as const,
  list: (query: PostQuery) => ["posts", "list", query] as const,
  trending: (query: PostQuery) => ["posts", "trending", query] as const,
  detail: (idOrSlug: string) => ["posts", "detail", idOrSlug] as const,
  related: (idOrSlug: string) => ["posts", "related", idOrSlug] as const,
  mine: (query: PostQuery) => ["posts", "mine", query] as const,
  byAuthor: (author: string, query: PostQuery) => ["posts", "author", author, query] as const,
  categories: ["categories"] as const,
  tags: ["tags"] as const,
  comments: (postId: string) => ["comments", postId] as const,
  author: (username: string) => ["author", username] as const,
  dashboard: ["dashboard"] as const,
};

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

export function useAuthor(username: string | undefined) {
  return useQuery({
    queryKey: postKeys.author(username ?? ""),
    queryFn: () => userService.getAuthor(username as string),
    enabled: Boolean(username),
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

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: postKeys.dashboard,
    queryFn: userService.getDashboardStats,
    enabled,
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

export function useComments(postId: string | undefined) {
  return useQuery({
    queryKey: postKeys.comments(postId ?? ""),
    queryFn: () => commentService.listComments(postId as string),
    enabled: Boolean(postId),
  });
}

export function useCommentMutations(postId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
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

/** Post create / update / delete, with the toasts the UX spec calls for. */
export function usePostMutations() {
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: postKeys.dashboard });
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

/** Follow / unfollow an author, refreshing that author's cached profile. */
export function useToggleFollow(username: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (following: boolean) => userService.setFollow(username as string, following),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.author(username ?? "") });
    },
    onError: (error) => toast.error(errorMessage(error, "Unable to update your follow.")),
  });
}
