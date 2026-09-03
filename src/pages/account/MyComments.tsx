import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { Badge } from "@/components/ui/badge";
import * as commentService from "@/features/comments/api/commentService";
import { pageCount } from "@/lib/api/normalize";
import { formatRelative } from "@/lib/format";

/**
 * Everything the reader has said, across every article.
 *
 * Useful in its own right, and the only practical way to find and revisit a
 * comment on an article you no longer remember the name of.
 */
export default function MyComments() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["comments", "mine", page],
    queryFn: () => commentService.listMyComments(page),
    placeholderData: (previous) => previous,
  });

  const comments = data?.items ?? [];

  return (
    <Layout>
      <Seo title="Your comments" noIndex />

      <div className="container-page max-w-3xl pb-20">
        <PageHeader
          className="mb-12"
          eyebrow="Marginalia / Account"
          title="Your comments"
          description={
            data?.count
              ? `${data.count} ${data.count === 1 ? "comment" : "comments"} across the site.`
              : "Everything you've said, newest first."
          }
        />

        {isError ? (
          <ErrorState error={error} title="We couldn't load your comments."
                      onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title="You haven't commented yet"
            description="Join a discussion and your comments collect here."
            action={{ label: "Find something to read", to: "/explore" }}
          />
        ) : (
          <>
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li key={comment.id} className="rounded-md border border-border p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatRelative(comment.createdAt)}</span>
                    {comment.isEdited && <span>· edited</span>}
                    {comment.isPinned && <Badge variant="outline">Pinned</Badge>}
                    {comment.isHidden && (
                      <Badge variant="outline" className="border-destructive/40 text-destructive">
                        Hidden by a moderator
                      </Badge>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap text-sm">{comment.content}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {comment.likeCount > 0 && (
                      <span>{comment.likeCount} {comment.likeCount === 1 ? "like" : "likes"}</span>
                    )}
                    {comment.postId && (
                      <Link to={`/post/${comment.postId}#comments`} className="hover:underline">
                        View in context
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {data && pageCount(data) > 1 && (
              <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
