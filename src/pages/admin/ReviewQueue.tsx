import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Check, ClipboardCheck, Undo2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import UserAvatar from "@/features/users/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useEditorialActions, useReviewQueue } from "@/features/posts/hooks/usePosts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { pageCount } from "@/lib/api/normalize";
import { formatRelative } from "@/lib/format";
import { authorPath } from "@/lib/routes";
import type { Post } from "@/features/posts/types";

/**
 * Submissions waiting on a decision.
 *
 * Oldest first, because a queue people take from the top of is a queue where
 * the oldest item never moves.
 */
export default function ReviewQueue() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [sendingBack, setSendingBack] = useState<Post | null>(null);
  const [note, setNote] = useState("");

  const canReview = Boolean(user?.canEditOthers);
  const { data, isLoading, isError, error, refetch } = useReviewQueue(page, canReview);
  const { review } = useEditorialActions();

  const posts = data?.items ?? [];

  return (
    <Layout>
      <Seo title="Review queue · Admin" noIndex />

      <div className="container-page max-w-3xl pb-20">
        <PageHeader
          className="mb-10"
          eyebrow="Marginalia / Admin"
          title="Review queue"
          description="Submissions from writers who can draft but not publish. Oldest first."
        />

        {isError ? (
          <ErrorState error={error} title="We couldn't load the queue."
                      onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="h-10 w-10" />}
            title="Nothing waiting"
            description="Submitted drafts appear here for you to publish or send back."
          />
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="rounded-md border border-border p-5">
                <div className="mb-3 flex items-start gap-3">
                  <UserAvatar user={post.author} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/post/${post.slug}`}
                      className="font-medium leading-snug hover:underline"
                    >
                      {post.title}
                    </Link>
                    {post.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      by{" "}
                      <Link to={authorPath(post.author)} className="hover:underline">
                        {post.author.name}
                      </Link>
                      {" · "}submitted {formatRelative(post.updatedAt)}
                      {" · "}{post.readingTime} min read
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/post/${post.slug}`}>Read it</Link>
                  </Button>
                  <Button
                    variant="outline" size="sm" className="gap-2"
                    onClick={() => {
                      setSendingBack(post);
                      setNote("");
                    }}
                  >
                    <Undo2 className="h-4 w-4" aria-hidden="true" />
                    Send back
                  </Button>
                  <Button
                    size="sm" className="gap-2"
                    disabled={review.isPending}
                    onClick={() => review.mutate({ slug: post.slug, action: "approve" })}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Publish
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {data && pageCount(data) > 1 && (
          <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
        )}
      </div>

      <Dialog open={Boolean(sendingBack)} onOpenChange={(open) => !open && setSendingBack(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send back for changes</DialogTitle>
            <DialogDescription>
              The writer sees this on their draft. Say what needs to change — a
              rejection without a reason isn&apos;t a review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="review-note">What needs changing?</Label>
            <Textarea
              id="review-note"
              rows={4}
              maxLength={500}
              value={note}
              autoFocus
              onChange={(event) => setNote(event.target.value)}
              placeholder="The opening buries the point — lead with the finding."
            />
            <p className="text-xs text-muted-foreground">{note.length}/500</p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSendingBack(null)}>Cancel</Button>
            <Button
              disabled={!note.trim() || review.isPending}
              onClick={() => {
                if (sendingBack) {
                  review.mutate({
                    slug: sendingBack.slug, action: "request_changes", note: note.trim(),
                  });
                }
                setSendingBack(null);
              }}
            >
              Send back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
