import { MessageSquareWarning, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorialActions } from "@/features/posts/hooks/usePosts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatRelative } from "@/lib/format";
import type { Post } from "@/features/posts/types";

/**
 * The writer's side of the editorial workflow.
 *
 * A contributor can draft but not publish, so without this their finished work
 * simply sits in a list nobody looks at. Three states:
 *
 *  - feedback waiting  → show it, offer to resubmit
 *  - awaiting review   → say so, and that there is nothing to do
 *  - ready to submit   → offer the button
 */
export default function ReviewBanner({ post }: { post: Post }) {
  const { user } = useAuth();
  const { submit } = useEditorialActions();

  const isAuthor = user && post.author.id === user.id;
  if (!isAuthor) return null;

  // Someone who can publish has no need of a review queue.
  if (user?.canPublish && !post.reviewNote && post.status !== "in_review") return null;

  if (post.reviewNote) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <MessageSquareWarning className="h-4 w-4" aria-hidden="true" />
          An editor asked for changes
          {post.reviewedAt && (
            <span className="font-normal text-muted-foreground">
              · {formatRelative(post.reviewedAt)}
            </span>
          )}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {post.reviewNote}
        </p>
        <Button
          size="sm"
          className="mt-3 gap-2"
          disabled={submit.isPending}
          onClick={() => submit.mutate(post.slug)}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Submit again
        </Button>
      </div>
    );
  }

  if (post.status === "in_review") {
    return (
      <div className="mb-6 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">Waiting for an editor</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll be notified when they publish it or ask for changes. Nothing
          to do in the meantime.
        </p>
      </div>
    );
  }

  if (post.status === "draft" && !user?.canPublish) {
    return (
      <div className="mb-6 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">Ready to publish?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account saves drafts; an editor publishes them. Send this over when
          you&apos;re happy with it.
        </p>
        <Button
          size="sm"
          className="mt-3 gap-2"
          disabled={submit.isPending}
          onClick={() => submit.mutate(post.slug)}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Submit for review
        </Button>
      </div>
    );
  }

  return null;
}
