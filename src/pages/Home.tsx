import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import BlogCard from "@/features/posts/components/BlogCard";
import FeaturedPost from "@/features/posts/components/FeaturedPost";
import PostMeta from "@/features/posts/components/PostMeta";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { PostGridSkeleton, PostListSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCategories, usePostList } from "@/features/posts/hooks/usePosts";
import { postPath } from "@/lib/routes";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/config/constants";

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <h2 className="text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button variant="ghost" asChild className="gap-1 text-sm">
          <Link to={action.to}>
            {action.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
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
  const highlights = rest.slice(0, 3);
  const feed = rest.slice(3);

  // Only worth its own section when it differs from the newest stories.
  const trending = (popular.data?.items ?? []).filter(
    (post) => post.likeCount != null || post.commentCount != null,
  );

  return (
    <Layout>
      <Seo title={undefined} description={SITE_DESCRIPTION} canonicalPath="/" />

      {/* Hero */}
      <section className="border-b border-border bg-muted/25">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl leading-[1.1] sm:text-5xl">{SITE_TAGLINE}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Discover thoughtful stories, ideas, tutorials and experiences from our community.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/explore">
                  Explore posts
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

      <div className="container-page py-14">
        {/* Featured */}
        {latest.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-full" />
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

        {/* Highlights */}
        {highlights.length > 0 && (
          <section className="mt-20">
            <SectionHeading title="Recent highlights" action={{ to: "/explore", label: "View all" }} />
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {(categoriesLoading || (categories?.length ?? 0) > 0) && (
          <section className="mt-20">
            <SectionHeading title="Browse by topic" />
            {categoriesLoading ? (
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-28 rounded-full" />
                ))}
              </div>
            ) : (
              <ul className="flex flex-wrap gap-3">
                {categories!.map((category) => (
                  <li key={category.slug}>
                    <Link
                      to={`/explore?category=${encodeURIComponent(category.slug)}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                      {category.name}
                      {category.count != null && (
                        <span className="text-xs text-muted-foreground">{category.count}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="mt-20 grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* Latest feed */}
          <section>
            <SectionHeading title="Latest stories" />
            {latest.isLoading ? (
              <PostListSkeleton />
            ) : feed.length ? (
              <div className="divide-y divide-border">
                {feed.map((post) => (
                  <BlogCard key={post.id} post={post} variant="row" />
                ))}
              </div>
            ) : posts.length ? (
              <p className="text-sm text-muted-foreground">
                You're all caught up. More stories are on the way.
              </p>
            ) : null}

            {latest.data?.hasNext && (
              <div className="mt-10">
                <Button variant="outline" asChild>
                  <Link to="/explore">See more stories</Link>
                </Button>
              </div>
            )}
          </section>

          {/* Trending */}
          <aside>
            <h2 className="mb-6 border-b border-border pb-4 text-lg">Popular right now</h2>
            {popular.isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : trending.length ? (
              <ol className="space-y-6">
                {trending.map((post, index) => (
                  <li key={post.id} className="flex gap-4">
                    <span
                      className="font-serif text-2xl font-semibold text-muted-foreground/40"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-snug">
                        <Link to={postPath(post)} className="transition-colors hover:text-primary">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {post.author.name}
                      </p>
                      <PostMeta post={post} className="mt-2" />
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                Popularity is measured once stories start collecting likes and comments.
              </p>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  );
}
