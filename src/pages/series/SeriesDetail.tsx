import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, Circle, Layers, Settings2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeries, useSeriesProgress } from "@/features/series/hooks/useSeries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authorPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * One series, with its parts in order.
 *
 * Progress is per-part rather than a single counter, so finishing part 4 before
 * part 3 is shown honestly instead of being rounded into "4 of 7 done".
 */
export default function SeriesDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { data: series, isLoading, isError, error, refetch } = useSeries(slug);
  const progress = useSeriesProgress(slug);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-page max-w-3xl space-y-4 py-10">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  }

  if (isError || !series) {
    return (
      <Layout>
        <div className="container-page py-16">
          <ErrorState error={error} title="We couldn't find that series." onRetry={() => refetch()} />
        </div>
      </Layout>
    );
  }

  const done = new Set(series.completedPostIds);
  const percent = series.postCount
    ? Math.round((series.completedCount / series.postCount) * 100)
    : 0;

  return (
    <Layout>
      <Seo
        title={series.title}
        description={series.description}
        image={series.coverImage}
        canonicalPath={`/series/${series.slug}`}
      />

      <div className="container-page max-w-3xl py-10">
        <header className="mb-8">
          <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" aria-hidden="true" />
            Series
          </p>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">{series.title}</h1>
          {series.description && (
            <p className="mt-3 text-lg text-muted-foreground">{series.description}</p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {series.postCount} {series.postCount === 1 ? "part" : "parts"} · by{" "}
            <Link to={authorPath(series.author)} className="hover:underline">
              {series.author.name}
            </Link>
          </p>

          {user && (series.author.id === user.id || user.canEditOthers) && (
            <Button variant="outline" size="sm" asChild className="mt-4 gap-2">
              <Link to={`/series/${series.slug}/manage`}>
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Manage series
              </Link>
            </Button>
          )}

          {isAuthenticated && series.postCount > 0 && (
            <div className="mt-6 rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Your progress</span>
                <span className="tabular-nums text-muted-foreground">
                  {series.completedCount} of {series.postCount}
                </span>
              </div>
              <Progress value={percent} className="h-2" />

              {series.nextPostSlug ? (
                <Button asChild className="mt-4 gap-2">
                  <Link to={`/post/${series.nextPostSlug}`}>
                    {series.completedCount === 0 ? "Start reading" : "Continue"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  You've finished this series.
                </p>
              )}
            </div>
          )}
        </header>

        {series.entries.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-10 w-10" />}
            title="No parts yet"
            description="The author hasn't added any posts to this series."
          />
        ) : (
          <ol className="space-y-2">
            {series.entries.map((entry) => {
              const finished = done.has(entry.post.id);
              return (
                <li
                  key={entry.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border border-border p-4 transition-colors",
                    finished && "bg-muted/40",
                  )}
                >
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() =>
                        progress.mutate({ postSlug: entry.post.slug, done: !finished })
                      }
                      disabled={progress.isPending}
                      className="mt-0.5 shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                      aria-pressed={finished}
                      aria-label={
                        finished
                          ? `Mark "${entry.post.title}" as unread`
                          : `Mark "${entry.post.title}" as read`
                      }
                    >
                      {finished ? (
                        <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    <span
                      className="mt-1 w-6 shrink-0 text-sm tabular-nums text-muted-foreground"
                      aria-hidden="true"
                    >
                      {String(entry.position).padStart(2, "0")}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/post/${entry.post.slug}`}
                      className="font-medium leading-snug hover:underline"
                    >
                      {entry.post.title}
                    </Link>
                    {entry.post.excerpt && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {entry.post.excerpt}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Part {entry.position} · {entry.post.readingTime} min read
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Layout>
  );
}
