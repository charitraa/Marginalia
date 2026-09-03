import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import SearchBar from "@/components/common/SearchBar";
import BlogCard from "@/features/posts/components/BlogCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { PostGridSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, usePostList, useTags } from "@/features/posts/hooks/usePosts";
import { useDebounce } from "@/hooks/useDebounce";
import { SORT_OPTIONS, POSTS_PER_PAGE } from "@/config/constants";
import { pageCount } from "@/lib/api/normalize";
import { cn } from "@/lib/utils";

/**
 * Discovery page. Every filter lives in the URL, so a filtered view can be
 * shared, bookmarked and restored by the back button.
 */
export default function Explore() {
  const [params, setParams] = useSearchParams();

  const category = params.get("category") ?? "all";
  const tag = params.get("tag") ?? "";
  const ordering = params.get("sort") ?? "latest";
  const page = Number(params.get("page") ?? 1) || 1;
  const urlSearch = params.get("q") ?? "";

  // Typing updates the input immediately and the query only once it settles.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const search = useDebounce(searchInput, 350);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Writing the debounced value back to the URL keeps state in one place.
  useEffect(() => {
    if (search === urlSearch) return;
    const next = new URLSearchParams(params);
    if (search) next.set("q", search);
    else next.delete("q");
    next.delete("page");
    setParams(next, { replace: true });
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  const query = useMemo(
    () => ({
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      tag: tag || undefined,
      ordering,
      page,
      pageSize: POSTS_PER_PAGE,
    }),
    [search, category, tag, ordering, page],
  );

  const { data, isLoading, isFetching, error, refetch } = usePostList(query);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const clearAll = () => {
    setSearchInput("");
    setParams(new URLSearchParams());
  };

  const hasFilters = Boolean(search || tag || (category && category !== "all") || ordering !== "latest");
  const posts = data?.items ?? [];

  return (
    <Layout>
      <Seo
        title="Explore"
        description="Browse every story on Marginalia by topic, popularity or recency."
        canonicalPath="/explore"
      />

      <div className="container-page pb-20">
        <PageHeader
          eyebrow="Marginalia / Archive"
          title="Explore"
          description="Every story published here, by topic, popularity or recency."
        />

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="lg:max-w-md lg:flex-1">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search stories, authors, topics…"
              busy={isFetching && !isLoading}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <label htmlFor="sort">Sort</label>
            </div>
            <Select value={ordering} onValueChange={(value) => update("sort", value)}>
              <SelectTrigger className="w-40" id="sort" aria-label="Sort stories">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" onClick={clearAll} className="text-sm">
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <nav aria-label="Filter by category" className="-mx-1 mt-8 overflow-x-auto border-b border-border">
            <ul className="flex min-w-max gap-7 px-1">
              {[{ slug: "all", name: "All", id: "all", description: "", count: null }, ...categories].map(
                (entry) => {
                  const active = category === entry.slug || (entry.slug === "all" && category === "all");
                  return (
                    <li key={entry.slug}>
                      <button
                        type="button"
                        onClick={() => update("category", entry.slug)}
                        aria-pressed={active}
                        className={cn(
                          "whitespace-nowrap border-b-2 pb-2.5 pt-1 font-sans text-sm transition-colors duration-200",
                          active
                            ? "border-primary text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {entry.name}
                        {entry.count != null && entry.slug !== "all" && (
                          <span className="ml-1.5 text-xs tabular-nums opacity-60">{entry.count}</span>
                        )}
                      </button>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>
        )}

        {/* Tags. The API's own list, ordered as it returns them; the selected
            one is always shown even if it falls outside the visible head. */}
        {(tags?.length ?? 0) > 0 && (
          <div className="mt-6 flex flex-wrap items-baseline gap-x-1.5 gap-y-2">
            <span className="eyebrow mr-2 py-1">Tags</span>
            {(() => {
              const head = (tags ?? []).slice(0, 14);
              const selected = (tags ?? []).find((entry) => entry.slug === tag);
              const shown =
                selected && !head.some((entry) => entry.slug === selected.slug)
                  ? [selected, ...head]
                  : head;
              return shown.map((entry) => {
                const active = tag === entry.slug;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update("tag", active ? null : entry.slug)}
                    className={cn(
                      "rounded-[3px] border px-2 py-1 font-sans text-xs transition-colors duration-200",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    #{entry.name}
                    {entry.count != null && (
                      <span className="ml-1.5 tabular-nums opacity-60">{entry.count}</span>
                    )}
                  </button>
                );
              });
            })()}
            {tag && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => update("tag", null)}
              >
                Clear tag
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="mt-10">
          {isLoading ? (
            <PostGridSkeleton count={6} />
          ) : error ? (
            <ErrorState
              error={error}
              title="We couldn't load these stories."
              onRetry={() => refetch()}
            />
          ) : posts.length === 0 ? (
            <EmptyState
              title="No stories found."
              description={
                hasFilters
                  ? "Nothing matches these filters yet. Try a broader search."
                  : "There is nothing published here yet."
              }
              action={hasFilters ? { label: "Reset filters", onClick: clearAll } : undefined}
            />
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground" role="status">
                {data?.count} {data?.count === 1 ? "story" : "stories"}
              </p>
              <div
                className={cn(
                  "grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3",
                  isFetching && "opacity-60 transition-opacity",
                )}
              >
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <Pagination
                page={page}
                pageCount={data ? pageCount(data) : 1}
                onPageChange={(next) => update("page", String(next))}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
