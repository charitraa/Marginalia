import { useState } from "react";
import { useParams } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import BlogCard from "@/features/posts/components/BlogCard";
import TopicFollowButton from "@/features/users/components/TopicFollowButton";
import { PostGridSkeleton } from "@/components/common/Skeletons";
import { useCategory, usePostList } from "@/features/posts/hooks/usePosts";
import { pageCount } from "@/lib/api/normalize";
import { POSTS_PER_PAGE } from "@/config/constants";

/**
 * A category's own page.
 *
 * Distinct from `/explore?category=…`, which is a filtered list: this has the
 * category's description, its post count and a follow button, so a topic is
 * something you can land on and subscribe to rather than a query parameter.
 */
export default function CategoryPage() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState(1);

  const category = useCategory(slug);
  const posts = usePostList({ category: slug, page, pageSize: POSTS_PER_PAGE }, Boolean(slug));

  if (category.isError) {
    return (
      <Layout>
        <div className="container-page py-16">
          <ErrorState
            error={category.error}
            title="We couldn't find that category."
            onRetry={() => category.refetch()}
          />
        </div>
      </Layout>
    );
  }

  const name = category.data?.name ?? slug;

  return (
    <Layout>
      <Seo
        title={name}
        description={category.data?.description || `Stories filed under ${name}.`}
        canonicalPath={`/category/${slug}`}
      />

      <div className="container-page py-10">
        <Breadcrumbs
          trail={[
            { name: "Home", to: "/" },
            { name: "Explore", to: "/explore" },
            { name },
          ]}
        />

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">{name}</h1>
            <TopicFollowButton kind="category" slug={slug} name={name} size="default" />
          </div>

          {category.data?.description && (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {category.data.description}
            </p>
          )}

          {category.data?.count != null && (
            <p className="mt-2 text-sm text-muted-foreground">
              {category.data.count} {category.data.count === 1 ? "story" : "stories"}
            </p>
          )}
        </header>

        {posts.isError ? (
          <ErrorState error={posts.error} title="We couldn't load these stories."
                      onRetry={() => posts.refetch()} />
        ) : posts.isLoading ? (
          <PostGridSkeleton count={6} />
        ) : (posts.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-10 w-10" />}
            title={`Nothing in ${name} yet`}
            description="Follow it and new stories will reach your feed as they're published."
            action={{ label: "Browse everything", to: "/explore" }}
          />
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.data?.items.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {posts.data && pageCount(posts.data) > 1 && (
              <Pagination
                page={page}
                pageCount={pageCount(posts.data)}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
