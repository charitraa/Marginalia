import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bookmark, Eye, Heart, MessageSquare, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import StatCard from "@/features/admin/components/StatCard";
import ViewsChart from "@/features/analytics/components/ViewsChart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as analyticsService from "@/features/analytics/api/analyticsService";

const PERIODS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

/** How the author's writing is doing. Their own numbers only. */
export default function Analytics() {
  const [period, setPeriod] = useState(30);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["analytics", "author", period],
    queryFn: () => analyticsService.getAuthorAnalytics(period),
    placeholderData: (previous) => previous,
  });

  return (
    <Layout>
      <Seo title="Analytics" noIndex />

      <div className="container-page py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Analytics</h1>
            <p className="mt-2 text-muted-foreground">
              How your writing is doing. Only you can see this.
            </p>
          </div>

          <Tabs value={String(period)} onValueChange={(value) => setPeriod(Number(value))}>
            <TabsList>
              {PERIODS.map((entry) => (
                <TabsTrigger key={entry.value} value={String(entry.value)}>
                  {entry.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </header>

        {isError ? (
          <ErrorState error={error} title="We couldn't load your analytics." onRetry={() => refetch()} />
        ) : isLoading || !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total views" value={data.totalViews}
                icon={<Eye className="h-4 w-4" />}
                hint={`${data.viewsInPeriod.toLocaleString()} in this period`}
              />
              <StatCard
                label="Unique readers" value={data.uniqueViewers}
                icon={<Users className="h-4 w-4" />}
                hint="counted without storing who they are"
              />
              <StatCard label="Likes" value={data.totalLikes} icon={<Heart className="h-4 w-4" />} />
              <StatCard
                label="Comments" value={data.totalComments}
                icon={<MessageSquare className="h-4 w-4" />}
              />
              <StatCard
                label="Saves" value={data.totalBookmarks}
                icon={<Bookmark className="h-4 w-4" />}
              />
              <StatCard label="Followers" value={data.followers} icon={<Users className="h-4 w-4" />} />
              <StatCard
                label="Published" value={data.publishedPosts}
                hint={`${data.draftPosts} drafts · ${data.scheduledPosts} scheduled`}
              />
              <StatCard label="All posts" value={data.totalPosts} />
            </div>

            <section aria-labelledby="views-over-time" className="mb-10 rounded-lg border border-border p-5">
              <h2 id="views-over-time" className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Views over the last {period} days
              </h2>
              <ViewsChart data={data.dailyViews} />
            </section>

            <section aria-labelledby="top-posts">
              <h2 id="top-posts" className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Your most read
              </h2>

              {data.topPosts.length === 0 ? (
                <EmptyState
                  icon={<BarChart3 className="h-10 w-10" />}
                  title="Nothing published yet"
                  description="Numbers appear once a post goes live."
                  action={{ label: "Write something", to: "/write" }}
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[34rem] text-sm">
                    <thead className="border-b border-border bg-muted/40 text-left">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-medium">Post</th>
                        <th scope="col" className="px-4 py-3 text-right font-medium">Views</th>
                        <th scope="col" className="px-4 py-3 text-right font-medium">Likes</th>
                        <th scope="col" className="px-4 py-3 text-right font-medium">Comments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.topPosts.map((post) => (
                        <tr key={post.slug}>
                          <td className="px-4 py-3">
                            <Link to={`/post/${post.slug}`} className="font-medium hover:underline">
                              {post.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {post.views.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">{post.likes}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{post.comments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
