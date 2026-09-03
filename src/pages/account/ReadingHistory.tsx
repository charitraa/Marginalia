import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import BlogCard from "@/features/posts/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as postService from "@/features/posts/api/postService";
import { pageCount } from "@/lib/api/normalize";
import { errorMessage } from "@/lib/errors";

/**
 * What the reader has opened, and how far they got.
 *
 * The "continue" tab is the useful one: articles started but not finished,
 * which is the list someone actually comes back for.
 */
export default function ReadingHistory() {
  const [unfinishedOnly, setUnfinishedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmClear, setConfirmClear] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["reading-history", unfinishedOnly, page],
    queryFn: () => postService.listReadingHistory({ unfinishedOnly, page }),
    placeholderData: (previous) => previous,
  });

  const clear = useMutation({
    mutationFn: () => postService.clearReadingHistory(),
    onSuccess: () => {
      toast.success("Reading history cleared.");
      queryClient.invalidateQueries({ queryKey: ["reading-history"] });
    },
    onError: (err) => toast.error(errorMessage(err, "Could not clear your history.")),
  });

  const entries = data?.items ?? [];

  return (
    <Layout>
      <Seo title="Reading history" noIndex />

      <div className="container-page pb-20">
        <PageHeader
          className="mb-10"
          eyebrow="Marginalia / Reading"
          title="Reading history"
          description="Only you can see this. Clearing it does not affect view counts."
          actions={
            entries.length > 0 && (
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() => setConfirmClear(true)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear history
              </Button>
            )
          }
        />

        <Tabs
          value={unfinishedOnly ? "continue" : "all"}
          onValueChange={(value) => {
            setUnfinishedOnly(value === "continue");
            setPage(1);
          }}
          className="mb-8"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">Everything</TabsTrigger>
            <TabsTrigger value="continue">Continue reading</TabsTrigger>
          </TabsList>
        </Tabs>

        {isError ? (
          <ErrorState error={error} title="We couldn't load your history." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<History className="h-10 w-10" />}
            title={unfinishedOnly ? "Nothing part-read" : "Nothing here yet"}
            description={
              unfinishedOnly
                ? "Articles you start but don't finish will wait for you here."
                : "Stories you read will show up here."
            }
            action={{ label: "Find something to read", to: "/explore" }}
          />
        ) : (
          <>
            <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <div key={entry.id}>
                  <BlogCard post={entry.post} />
                  {!entry.isFinished && entry.progress > 0 && (
                    <div className="mt-3">
                      <Progress value={entry.progress} className="h-1" />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.progress}% read
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {data && pageCount(data) > 1 && (
              <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear your reading history?"
        description="This removes every entry, including where you'd got to in part-read articles. It cannot be undone."
        confirmLabel="Clear history"
        destructive
        loading={clear.isPending}
        onConfirm={() => {
          clear.mutate();
          setConfirmClear(false);
        }}
      />
    </Layout>
  );
}
