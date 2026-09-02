import { useState } from "react";
import { Rss, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import BlogCard from "@/features/posts/components/BlogCard";
import { PostGridSkeleton } from "@/components/common/Skeletons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeed, useRecommendedPosts } from "@/features/posts/hooks/usePosts";
import { pageCount } from "@/lib/api/normalize";

/**
 * The reader's own feed.
 *
 * "Following" is strictly chronological — the reader chose those
 * subscriptions, so reordering them would second-guess an explicit
 * instruction. "For you" is the ranked one.
 */
export default function Feed() {
  const [tab, setTab] = useState<"following" | "recommended">("following");
  const [page, setPage] = useState(1);

  const following = useFeed({ page }, tab === "following");
  const recommended = useRecommendedPosts(page, tab === "recommended");
  const active = tab === "following" ? following : recommended;

  const posts = active.data?.items ?? [];

  return (
    <Layout>
      <Seo title="Your feed" noIndex />

      <div className="container-page py-10">
        <header className="mb-6">
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Your feed</h1>
          <p className="mt-2 text-muted-foreground">
            Writers, categories and tags you follow — plus a few suggestions.
          </p>
        </header>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as "following" | "recommended");
            setPage(1);
          }}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="following" className="gap-2">
              <Rss className="h-4 w-4" aria-hidden="true" />
              Following
            </TabsTrigger>
            <TabsTrigger value="recommended" className="gap-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              For you
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {active.isError ? (
          <ErrorState
            error={active.error}
            title="We couldn't load your feed."
            onRetry={() => active.refetch()}
          />
        ) : active.isLoading ? (
          <PostGridSkeleton count={6} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Rss className="h-10 w-10" />}
            title={tab === "following" ? "Your feed is empty" : "Nothing to suggest yet"}
            description={
              tab === "following"
                ? "Follow a writer, category or tag and their new posts will land here."
                : "Like or save a few stories and suggestions will start to appear."
            }
            action={{ label: "Explore stories", to: "/explore" }}
          />
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            {active.data && pageCount(active.data) > 1 && (
              <Pagination
                page={page}
                pageCount={pageCount(active.data)}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
