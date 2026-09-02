import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import SearchBar from "@/components/common/SearchBar";
import BlogCard from "@/features/posts/components/BlogCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { PostListSkeleton } from "@/components/common/Skeletons";
import { useSemanticSearch } from "@/features/posts/hooks/usePosts";
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
  // Semantic search ranks by meaning, so "how do I stop XSS" finds an article
  // called "Preventing cross-site scripting". The API falls back to keywords
  // on its own and tells us which one ran.
  const { data, isLoading, isFetching, error, refetch } = useSemanticSearch(
    debounced, page, enabled,
  );

  const posts = data?.items ?? [];

  return (
    <Layout>
      <Seo
        title={term ? `Search: ${term}` : "Search"}
        description="Search stories across Marginalia."
        canonicalPath="/search"
        noIndex
      />

      <div className="container-page pb-20">
        <PageHeader
          eyebrow="Marginalia / Search"
          title="Search"
          description="Find stories by title, content, author or topic."
        />

        <div className="mt-10 max-w-xl">
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
              description="Try describing what you're looking for in your own words — search understands meaning, not just exact words."
              action={{ label: "Browse all stories", to: "/explore" }}
            />
          ) : (
            <>
              <p className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground" role="status">
                <span>
                  {data?.count} {data?.count === 1 ? "result" : "results"} for “{debounced}”
                </span>
                {data?.semantic && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
                    title="Ranked by meaning, so results need not share your exact words."
                  >
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    ranked by meaning
                  </span>
                )}
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
