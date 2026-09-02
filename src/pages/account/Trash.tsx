import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import * as postService from "@/features/posts/api/postService";
import { postKeys } from "@/features/posts/api/queryKeys";
import { pageCount } from "@/lib/api/normalize";
import { formatRelative } from "@/lib/format";
import { errorMessage } from "@/lib/errors";

/**
 * Deleted posts.
 *
 * Deleting is a soft delete, so this is a trash can rather than a graveyard:
 * everything here still has its comments and likes and can be put back.
 */
export default function Trash() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["trash", page],
    queryFn: () => postService.listTrash(page),
    placeholderData: (previous) => previous,
  });

  const restore = useMutation({
    mutationFn: (slug: string) => postService.runLifecycleAction(slug, "restore"),
    onSuccess: (post) => {
      toast.success(`“${post.title}” is back in your drafts.`);
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (err) => toast.error(errorMessage(err, "Could not restore that post.")),
  });

  const posts = data?.items ?? [];

  return (
    <Layout>
      <Seo title="Trash" noIndex />

      <div className="container-page max-w-3xl py-10">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Trash</h1>
          <p className="mt-2 text-muted-foreground">
            Deleted posts keep their comments and likes. Restore one to put it back as a draft.
          </p>
        </header>

        {isError ? (
          <ErrorState error={error} title="We couldn't load your trash." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Trash2 className="h-10 w-10" />}
            title="Trash is empty"
            description="Posts you delete land here so a misclick is recoverable."
            action={{ label: "Back to dashboard", to: "/dashboard" }}
          />
        ) : (
          <>
            <ul className="space-y-3">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.commentCount ?? 0} comments · {post.likeCount ?? 0} likes ·
                      last edited {formatRelative(post.updatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => restore.mutate(post.slug)}
                    disabled={restore.isPending}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Restore
                  </Button>
                </li>
              ))}
            </ul>

            {data && pageCount(data) > 1 && (
              <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
            )}
          </>
        )}

        <p className="mt-8 flex items-start gap-2 text-xs text-muted-foreground">
          <Archive className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Looking to hide a published post without deleting it? Archive it from the
          <Link to="/dashboard" className="mx-1 underline">dashboard</Link>
          instead — it keeps its URL for anyone holding a link.
        </p>
      </div>
    </Layout>
  );
}
