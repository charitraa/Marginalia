import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import SearchBar from "@/components/common/SearchBar";
import BlogCard from "@/features/posts/components/BlogCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { PostListSkeleton } from "@/components/common/Skeletons";
import { usePostList } from "@/features/posts/hooks/usePosts";
import { useDebounce } from "@/hooks/useDebounce";
import { POSTS_PER_PAGE } from "@/config/constants";
import { pageCount } from "@/lib/api/normalize";

/**
 * Full-page search. The API matches titles, excerpts, bodies, authors,
 * categories and tags, so one box covers everything.
 */
export default function Search() {
  const [params, setParams] = useSearchParams();
  const term = params.get("q") ?? "";
  const page = Number(params.get("page") ?? 1) || 1;

  const [input, setInput] = useState(term);
  const debounced = useDebounce(input, 350);

  useEffect(() => {
    setInput(term);
  }, [term]);

  useEffect(() => {
    if (debounced === term) return;
    const next = new URLSearchParams(params);
    if (debounced) next.set("q", debounced);
    else next.delete("q");
    next.delete("page");
    setParams(next, { replace: true });
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  const enabled = debounced.trim().length > 0;
  const { data, isLoading, isFetching, error, refetch } = usePostList(
    { search: debounced, page, pageSize: POSTS_PER_PAGE },
    enabled,
  );

  const posts = data?.items ?? [];

  return (
    <Layout>
      <Seo
        title={term ? `Search: ${term}` : "Search"}
        description="Search stories across Mindful Blog."
        canonicalPath="/search"
        noIndex
      />

      <div className="container-page py-12 sm:py-16">
        <header className="max-w-2xl">
          <h1 className="text-4xl">Search</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Find stories by title, content, author or topic.
          </p>
        </header>

        <div className="mt-8 max-w-xl">
          <SearchBar
            value={input}
            onChange={setInput}
            placeholder="Search stories…"
            busy={isFetching && !isLoading}
            autoFocus
          />
        </div>

        <div className="mt-10">
          {!enabled ? (
            <EmptyState
              title="Start typing to search."
              description="Search across every published story, author and topic."
            />
          ) : isLoading ? (
            <PostListSkeleton count={4} />
          ) : error ? (
            <ErrorState error={error} title="We couldn't run that search." onRetry={() => refetch()} />
          ) : posts.length === 0 ? (
            <EmptyState
              title={`No results for "${debounced}".`}
              description="Try a different word, or browse everything instead."
              action={{ label: "Browse all stories", to: "/explore" }}
            />
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground" role="status">
                {data?.count} {data?.count === 1 ? "result" : "results"} for “{debounced}”
              </p>
              <div className="divide-y divide-border">
                {posts.map((post) => (
                  <div key={post.id} className="py-6 first:pt-0">
                    <BlogCard post={post} variant="row" />
                  </div>
                ))}
              </div>
              <Pagination
                page={page}
                pageCount={data ? pageCount(data) : 1}
                onPageChange={(next) => {
                  const url = new URLSearchParams(params);
                  url.set("page", String(next));
                  setParams(url);
                }}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
