import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Bookmark, Eye, Heart, MessageSquare, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { StatsSkeleton } from "@/components/common/Skeletons";
import PageHeader from "@/components/common/PageHeader";
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

      <div className="container-page pb-20">
        <PageHeader
          className="mb-12"
          eyebrow="Marginalia / Studio"
          title="Analytics"
          description="How your writing is doing. Only you can see this."
          actions={
            <Tabs value={String(period)} onValueChange={(value) => setPeriod(Number(value))}>
              <TabsList>
                {PERIODS.map((entry) => (
                  <TabsTrigger key={entry.value} value={String(entry.value)}>
                    {entry.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          }
        />

        {isError ? (
          <ErrorState error={error} title="We couldn't load your analytics." onRetry={() => refetch()} />
        ) : isLoading || !data ? (
          <StatsSkeleton count={8} />
        ) : (
          <>
            <div className="mb-10 grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
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

            <section aria-labelledby="views-over-time" className="mb-10 rounded-md border border-border p-5">
              <h2 id="views-over-time" className="eyebrow mb-4">
                Views over the last {period} days
              </h2>
              <ViewsChart data={data.dailyViews} />
            </section>

            <section aria-labelledby="top-posts">
              <h2 id="top-posts" className="eyebrow mb-4">
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
                <div className="overflow-x-auto rounded-md border border-border">
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
