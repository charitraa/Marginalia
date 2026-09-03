import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import BlogCard from "@/features/posts/components/BlogCard";
import FeaturedPost from "@/features/posts/components/FeaturedPost";
import NumberedStory from "@/features/posts/components/NumberedStory";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { PostGridSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCategories, usePostList } from "@/features/posts/hooks/usePosts";
import { categoryPath } from "@/lib/routes";
import { SITE_DESCRIPTION, SITE_NAME } from "@/config/constants";

/** A section opener: hairline, title, and an optional way out to the full list. */
function SectionHeading({
  title,
  action,
  className,
}: {
  title: string;
  action?: { to: string; label: string };
  className?: string;
}) {
  return (
    <div className={`section-head mb-10 ${className ?? ""}`}>
      <h2 className="section-title">{title}</h2>
      {action && (
        <Link
          to={action.to}
          className="group/link inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {action.label}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-200 ease-editorial group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const latest = usePostList({ ordering: "latest", pageSize: 10 });
  const popular = usePostList({ ordering: "popular", pageSize: 4 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const posts = latest.data?.items ?? [];
  const [featured, ...rest] = posts;
  const grid = rest.slice(0, 6);

  // Only worth its own section when it differs from the newest stories.
  const trending = (popular.data?.items ?? []).filter(
    (post) => post.likeCount != null || post.commentCount != null,
  );

  return (
    <Layout>
      <Seo title={undefined} description={SITE_DESCRIPTION} canonicalPath="/" />

      {/* Hero. The masthead label hangs in the margin; the statement carries the page. */}
      <section className="container-page pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="rail">
          <p className="rail-label">{SITE_NAME} / Journal</p>
          <div>
            <h1 className="max-w-[19ch] font-serif text-display font-semibold">
              Ideas worth reading. Thoughts worth keeping.
            </h1>
            <p className="mt-8 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
              An independent publication about software, design and the thinking behind
              them — written slowly, and meant to be read the same way.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/explore">
                  Explore articles
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to={isAuthenticated ? "/write" : "/register"}>
                  <PenLine className="h-4 w-4" aria-hidden="true" />
                  Start writing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page pb-24">
        {/* Featured */}
        <section>
          <SectionHeading title="Featured" />
          {latest.isLoading ? (
            <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
              <Skeleton className="aspect-[5/4] w-full rounded-md" />
              <div className="space-y-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ) : latest.error ? (
            <ErrorState
              error={latest.error}
              title="Couldn't load stories"
              onRetry={() => latest.refetch()}
            />
          ) : !posts.length ? (
            <EmptyState
              title="No stories yet"
              description="Once the first story is published it will appear right here."
            >
              <Button asChild>
                <Link to={isAuthenticated ? "/write" : "/register"}>Write the first story</Link>
              </Button>
            </EmptyState>
          ) : (
            <FeaturedPost post={featured} />
          )}
        </section>

        {/* Latest stories */}
        {(latest.isLoading || grid.length > 0) && (
          <section className="mt-28">
            <SectionHeading title="Latest stories" action={{ to: "/explore", label: "View all" }} />
            {latest.isLoading ? (
              <PostGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Popular. A ranking, so the numbers are information rather than decoration. */}
        {(popular.isLoading || trending.length > 0) && (
          <section className="mt-28">
            <SectionHeading title="Popular this week" />
            {popular.isLoading ? (
              <div className="grid gap-x-14 gap-y-8 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex gap-5 border-t border-border pt-5">
                    <Skeleton className="h-8 w-8 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ol className="grid gap-x-14 sm:grid-cols-2">
                {trending.map((post, index) => (
                  <li key={post.id}>
                    <NumberedStory post={post} rank={index + 1} />
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}

        {/* Topics. Typography and spacing rather than a wall of chips. */}
        {(categoriesLoading || (categories?.length ?? 0) > 0) && (
          <section className="mt-28">
            <SectionHeading title="Browse by topic" />
            {categoriesLoading ? (
              <div className="grid gap-x-14 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="border-t border-border py-6">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="mt-2.5 h-3 w-64" />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="grid gap-x-14 sm:grid-cols-2">
                {categories!.map((category) => (
                  <li key={category.slug} className="border-t border-border">
                    <Link
                      to={categoryPath(category.slug)}
                      className="group block py-6 transition-colors"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-serif text-2xl font-semibold transition-colors duration-200 group-hover:text-primary">
                          {category.name}
                        </h3>
                        {category.count != null && (
                          <span className="shrink-0 font-sans text-xs tabular-nums text-muted-foreground">
                            {category.count}
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="mt-2 line-clamp-2 max-w-measure font-sans text-sm leading-relaxed text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}
