import { useState } from "react";
import { Bookmark } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import BlogCard from "@/features/posts/components/BlogCard";
import { PostGridSkeleton } from "@/components/common/Skeletons";
import { useBookmarkList } from "@/features/bookmarks/hooks/useBookmarks";
import { pageCount } from "@/lib/api/normalize";

/**
 * The reader's saved posts.
 *
 * Ordered by when each was saved rather than when it was published, because
 * that is the order the reader actually built the list in.
 */
export default function Bookmarks() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useBookmarkList({ page });

  const posts = data?.items ?? [];

  return (
    <Layout>
      <Seo title="Your reading list" noIndex />

      <div className="container-page py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Reading list</h1>
          <p className="mt-2 text-muted-foreground">
            {data?.count
              ? `${data.count} ${data.count === 1 ? "story" : "stories"} saved for later`
              : "Stories you save for later live here."}
          </p>
        </div>

        {isLoading ? (
          <PostGridSkeleton count={6} />
        ) : isError ? (
          <ErrorState
            error={error}
            title="We couldn't load your reading list."
            onRetry={() => refetch()}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-10 w-10" />}
            title="Nothing saved yet"
            description="Tap the bookmark icon on any story to keep it here."
            action={{ label: "Browse stories", to: "/explore" }}
          />
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            <Pagination
              page={page}
              pageCount={data ? pageCount(data) : 1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
