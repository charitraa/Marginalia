import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import BlogCard from "@/features/posts/components/BlogCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { PostGridSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { useTrendingPosts } from "@/features/posts/hooks/usePosts";
import { cn } from "@/lib/utils";

/**
 * Trending is ranked entirely by the API, from real likes, comments and views
 * inside the chosen window. Nothing here is weighted client side.
 */
const WINDOWS = [
  { days: 7, label: "This week" },
  { days: 30, label: "This month" },
  { days: 365, label: "This year" },
];

export default function Trending() {
  const [days, setDays] = useState(30);
  const { data, isLoading, error, refetch } = useTrendingPosts({ days, pageSize: 12 });
  const posts = data?.items ?? [];

  return (
    <Layout>
      <Seo
        title="Trending"
        description="The stories readers are engaging with most on Marginalia."
        canonicalPath="/trending"
      />

      <div className="container-page pb-20">
        <PageHeader
          eyebrow="Marginalia / Trending"
          title="Trending"
          description="What readers are engaging with most right now."
        >
          <div className="mt-7 flex gap-2" role="group" aria-label="Trending period">
            {WINDOWS.map((option) => (
              <Button
                key={option.days}
                variant={days === option.days ? "default" : "outline"}
                size="sm"
                aria-pressed={days === option.days}
                onClick={() => setDays(option.days)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </PageHeader>

        <div className="mt-10">
          {isLoading ? (
            <PostGridSkeleton count={6} />
          ) : error ? (
            <ErrorState error={error} title="We couldn't load trending stories." onRetry={() => refetch()} />
          ) : posts.length === 0 ? (
            <EmptyState
              title="Nothing is trending yet."
              description="Once readers start liking and discussing stories, they will show up here."
              action={{ label: "Browse all stories", to: "/explore" }}
            />
          ) : (
            <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <li key={post.id} className="relative">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -left-1 -top-3 z-10 text-5xl font-bold leading-none",
                      "text-foreground/10",
                    )}
                  >
                    {index + 1}
                  </span>
                  <BlogCard post={post} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </Layout>
  );
}
