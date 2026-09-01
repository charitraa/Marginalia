import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import CommentItem from "@/components/blog/CommentItem";
import UserAvatar from "@/components/blog/UserAvatar";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { CommentSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCommentMutations, useComments } from "@/hooks/usePosts";
import type { AxiosError } from "axios";

const MAX_LENGTH = 1000;

/**
 * The comment thread for a post. Replies are rendered when the API returns
 * them; otherwise the thread stays flat rather than faking nesting.
 */
export default function CommentSection({ postId }: { postId: string }) {
  const { isAuthenticated, user } = useAuth();
  const { data: comments, isLoading, error, refetch } = useComments(postId);
  const { create, update, remove } = useCommentMutations(postId);
  const [draft, setDraft] = useState("");

  const total = comments?.reduce((sum, comment) => sum + 1 + comment.replies.length, 0) ?? 0;
  // Some deployments require a session even to read comments.
  const requiresAuthToRead = (error as AxiosError)?.response?.status === 401 && !isAuthenticated;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    await create.mutateAsync({ content });
    setDraft("");
  };

  return (
    <section aria-labelledby="comments-heading" className="scroll-mt-24" id="comments">
      <h2 id="comments-heading" className="text-2xl">
        {total > 0 ? `${total} ${total === 1 ? "comment" : "comments"}` : "Comments"}
      </h2>

      {isAuthenticated ? (
        <form onSubmit={submit} className="mt-6">
          <div className="flex gap-3">
            {user && <UserAvatar user={user} size="sm" className="mt-1 shrink-0" />}
            <div className="min-w-0 flex-1">
              <label htmlFor="new-comment" className="sr-only">
                Write a comment
              </label>
              <Textarea
                id="new-comment"
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, MAX_LENGTH))}
                placeholder="Write a thoughtful comment…"
                rows={3}
                className="resize-y"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {draft.length}/{MAX_LENGTH}
                </span>
                <Button type="submit" disabled={!draft.trim() || create.isPending}>
                  {create.isPending ? "Posting…" : "Post comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-lg border border-border bg-muted/40 px-5 py-4 text-sm">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{" "}
          <span className="text-muted-foreground">to join the conversation.</span>
        </div>
      )}

      <div className="mt-10">
        {isLoading ? (
          <CommentSkeleton />
        ) : requiresAuthToRead ? (
          <EmptyState
            icon={<MessageCircle className="h-8 w-8" />}
            title="Comments are visible to members"
            description="Sign in to read what other readers are saying about this story."
          />
        ) : error ? (
          <ErrorState
            error={error}
            title="Couldn't load comments"
            fallback="We couldn't load the comments for this story."
            onRetry={() => refetch()}
          />
        ) : !comments?.length ? (
          <EmptyState
            icon={<MessageCircle className="h-8 w-8" />}
            title="No comments yet"
            description="Be the first to share your thoughts."
          />
        ) : (
          <div className="space-y-8">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                busy={update.isPending || remove.isPending}
                onUpdate={(id, content) => update.mutateAsync({ id, content })}
                onDelete={(id) => remove.mutateAsync(id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
