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
import FeaturedPost from "@/features/posts/components/FeaturedPost";
import NumberedStory from "@/features/posts/components/NumberedStory";
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
  // The same list ranked the other way. Only the first page shows it, and only
  // when the topic has enough stories for a ranking to mean anything.
  const popular = usePostList(
    { category: slug, ordering: "popular", pageSize: 5 },
    Boolean(slug) && page === 1,
  );

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
  const items = posts.data?.items ?? [];
  const [lead, ...rest] = items;
  const grid = page === 1 ? rest : items;
  // Anything already shown above is not repeated in the ranking.
  const mostRead = (popular.data?.items ?? []).filter((post) => post.id !== lead?.id).slice(0, 4);

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

        <header className="rail mb-14 border-b border-foreground/15 pb-10 pt-6">
          <p className="rail-label">Marginalia / Topic</p>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{name}</h1>
              <TopicFollowButton kind="category" slug={slug} name={name} size="default" />
            </div>

            {category.data?.description && (
              <p className="mt-5 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
                {category.data.description}
              </p>
            )}

            {category.data?.count != null && (
              <p className="mt-4 font-sans text-xs tabular-nums text-muted-foreground">
                {category.data.count} {category.data.count === 1 ? "story" : "stories"}
              </p>
            )}
          </div>
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
            {/* On the first page the newest story leads the topic; after that
                the list is a plain continuation. */}
            {page === 1 && lead && (
              <section className="mb-20">
                <FeaturedPost post={lead} />
              </section>
            )}

            {grid.length > 0 && (
              <section>
                {page === 1 && (
                  <div className="section-head mb-10">
                    <h2 className="section-title">More in {name}</h2>
                  </div>
                )}
                <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {grid.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {posts.data && pageCount(posts.data) > 1 && (
              <Pagination
                page={page}
                pageCount={pageCount(posts.data)}
                onPageChange={setPage}
              />
            )}

            {/* Ranked by the API, from real engagement — never re-sorted here. */}
            {page === 1 && mostRead.length > 1 && (
              <section className="mt-24">
                <div className="section-head mb-10">
                  <h2 className="section-title">Most read in {name}</h2>
                </div>
                <ol className="grid gap-x-14 sm:grid-cols-2">
                  {mostRead.map((post, index) => (
                    <li key={post.id}>
                      <NumberedStory post={post} rank={index + 1} />
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
