import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import SearchBar from "@/components/common/SearchBar";
import BlogCard from "@/components/blog/BlogCard";
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
import { useCategories, usePostList } from "@/hooks/usePosts";
import { useDebounce } from "@/hooks/useDebounce";
import { SORT_OPTIONS, POSTS_PER_PAGE } from "@/constants";
import { pageCount } from "@/services/normalizers";
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
        description="Browse every story on Mindful Blog by topic, popularity or recency."
        canonicalPath="/explore"
      />

      <div className="container-page py-12 sm:py-16">
        <header className="max-w-2xl">
          <h1 className="text-4xl">Explore</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Browse every story by topic, popularity or recency.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
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
          <nav aria-label="Filter by category" className="mt-6 -mx-1 overflow-x-auto pb-2">
            <ul className="flex min-w-max gap-2 px-1">
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
                          "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                        )}
                      >
                        {entry.name}
                        {entry.count != null && entry.slug !== "all" && (
                          <span className="ml-1.5 text-xs opacity-70">{entry.count}</span>
                        )}
                      </button>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>
        )}

        {tag && (
          <p className="mt-4 text-sm text-muted-foreground">
            Tagged <span className="font-medium text-foreground">#{tag}</span>
            <Button variant="link" className="h-auto p-0 pl-2 text-sm" onClick={() => update("tag", null)}>
              clear
            </Button>
          </p>
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
                  "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3",
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
