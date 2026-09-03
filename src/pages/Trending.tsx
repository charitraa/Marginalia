import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import NumberedStory from "@/features/posts/components/NumberedStory";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { RankedListSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { useTrendingPosts } from "@/features/posts/hooks/usePosts";

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
            <RankedListSkeleton count={3} />
          ) : error ? (
            <ErrorState error={error} title="We couldn't load trending stories." onRetry={() => refetch()} />
          ) : posts.length === 0 ? (
            <EmptyState
              title="Nothing is trending yet."
              description="Once readers start liking and discussing stories, they will show up here."
              action={{ label: "Browse all stories", to: "/explore" }}
            />
          ) : (
            /* The top three carry the ranking; the rest continue it as a list,
               so the page reads as one ordered thing rather than a grid with
               numbers stuck on it. */
            <ol>
              {posts.slice(0, 3).map((post, index) => (
                <li key={post.id} className="mb-12">
                  <NumberedStory
                    post={post}
                    rank={index + 1}
                    variant="lead"
                    /* The masthead already drew a rule; the first story does
                       not need a second one directly under it. */
                    className={index === 0 ? "border-t-0 pt-0" : undefined}
                  />
                </li>
              ))}
              {posts.length > 3 && (
                <li>
                  <ol className="grid gap-x-14 sm:grid-cols-2">
                    {posts.slice(3).map((post, index) => (
                      <li key={post.id}>
                        <NumberedStory post={post} rank={index + 4} />
                      </li>
                    ))}
                  </ol>
                </li>
              )}
            </ol>
          )}
        </div>
      </div>
    </Layout>
  );
}
