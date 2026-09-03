import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { CheckCircle2, EyeOff, Flag, Undo2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import UserAvatar from "@/features/users/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModerationAction, useModerationReports } from "@/features/admin/hooks/useAdmin";
import { pageCount } from "@/lib/api/normalize";
import { authorPath } from "@/lib/routes";
import { formatRelative } from "@/lib/format";
import type { ReportStatus } from "@/features/admin/types";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam or advertising",
  abuse: "Harassment or hate",
  off_topic: "Off topic",
  other: "Something else",
};

/**
 * The moderation queue.
 *
 * Hiding a comment never deletes it, so every decision here is reversible —
 * which is what makes it safe to act quickly on a report.
 */
export default function AdminModeration() {
  const [status, setStatus] = useState<ReportStatus | "all">("open");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useModerationReports(status, page);
  const act = useModerationAction();

  const reports = data?.items ?? [];

  return (
    <Layout>
      <Seo title="Moderation · Admin" noIndex />

      <div className="container-page max-w-4xl pb-20">
        <PageHeader
          className="mb-10"
          eyebrow="Marginalia / Admin"
          title="Moderation"
          description="Reported comments. Hiding removes a comment from public threads but keeps it here."
        />

        <Tabs
          value={status}
          onValueChange={(value) => {
            setStatus(value as ReportStatus | "all");
            setPage(1);
          }}
          className="mb-6"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="reviewed">Actioned</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {isError ? (
          <ErrorState error={error} title="We couldn't load the queue." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={<Flag className="h-10 w-10" />}
            title={status === "open" ? "Queue is clear" : "Nothing here"}
            description={
              status === "open"
                ? "No comments are waiting on a decision."
                : "No reports with this status."
            }
          />
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.id} className="rounded-md border border-border p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{REASON_LABELS[report.reason] ?? report.reason}</Badge>
                  {report.commentIsHidden && (
                    <Badge variant="outline" className="border-destructive/40 text-destructive">
                      Hidden
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    reported by{" "}
                    <Link to={authorPath(report.reporter)} className="hover:underline">
                      {report.reporter.name}
                    </Link>{" "}
                    {formatRelative(report.createdAt)}
                  </span>
                </div>

                {report.detail && (
                  <p className="mb-3 rounded-md bg-muted/50 px-3 py-2 text-sm italic text-muted-foreground">
                    “{report.detail}”
                  </p>
                )}

                <div className="mb-3 flex items-start gap-3 rounded-md border border-border p-3">
                  <UserAvatar user={report.commentAuthor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={authorPath(report.commentAuthor)}
                      className="text-sm font-medium hover:underline"
                    >
                      {report.commentAuthor.name}
                    </Link>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                      {report.commentContent}
                    </p>
                    <Link
                      to={`/post/${report.postSlug}#comments`}
                      className="mt-2 inline-block text-xs text-muted-foreground hover:underline"
                    >
                      on “{report.postTitle}”
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  {report.commentIsHidden ? (
                    <Button
                      variant="outline" size="sm" className="gap-2"
                      onClick={() => act.mutate({ reportId: report.id, action: "unhide" })}
                      disabled={act.isPending}
                    >
                      <Undo2 className="h-4 w-4" aria-hidden="true" />
                      Restore comment
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost" size="sm" className="gap-2"
                        onClick={() => act.mutate({ reportId: report.id, action: "dismiss" })}
                        disabled={act.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Dismiss
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => act.mutate({ reportId: report.id, action: "hide" })}
                        disabled={act.isPending}
                      >
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                        Hide comment
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {data && pageCount(data) > 1 && (
          <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
        )}
      </div>
    </Layout>
  );
}
