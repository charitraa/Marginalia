import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import BlogCard from "@/components/blog/BlogCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { PostGridSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { useTrendingPosts } from "@/hooks/usePosts";
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
        description="The stories readers are engaging with most on Mindful Blog."
        canonicalPath="/trending"
      />

      <div className="container-page py-12 sm:py-16">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl">Trending</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              What readers are engaging with most right now.
            </p>
          </div>

          <div className="flex gap-2" role="group" aria-label="Trending period">
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
        </header>

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
