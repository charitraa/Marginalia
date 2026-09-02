import { useState } from "react";
import { Link } from "react-router-dom";
import { Layers, Plus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import SeriesCard from "@/features/series/components/SeriesCard";
import { useSeriesList, useSeriesMutations } from "@/features/series/hooks/useSeries";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { pageCount } from "@/lib/api/normalize";

/** Every published series. */
export default function SeriesList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const debounced = useDebounce(search, 300);

  const { isAuthenticated, user } = useAuth();
  const { create } = useSeriesMutations();

  const { data, isLoading, isError, error, refetch } = useSeriesList({
    search: debounced,
    page,
  });
  const series = data?.items ?? [];

  return (
    <Layout>
      <Seo
        title="Series"
        description="Multi-part guides, read in order."
        canonicalPath="/series"
      />

      <div className="container-page py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Series</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Multi-part guides meant to be read in order. Your place is remembered as you go.
            </p>
          </div>

          {isAuthenticated && user?.canPublish && (
            <Button className="gap-2" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New series
            </Button>
          )}
        </header>

        <div className="mb-8 max-w-md">
          <SearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search series"
          />
        </div>

        {isError ? (
          <ErrorState error={error} title="We couldn't load the series." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : series.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-10 w-10" />}
            title="No series yet"
            description="When a writer groups posts into a run, it shows up here."
            action={{ label: "Browse stories", to: "/explore" }}
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {series.map((entry) => (
                <SeriesCard key={entry.id} series={entry} />
              ))}
            </div>
            {data && pageCount(data) > 1 && (
              <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a series</DialogTitle>
            <DialogDescription>
              Group related posts into a run readers can work through in order.
              You add the parts next.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-series-title">Title</Label>
              <Input
                id="new-series-title"
                value={newTitle}
                autoFocus
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Web Hacking"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-series-description">Description</Label>
              <Textarea
                id="new-series-description"
                rows={3}
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="What the series covers, and who it is for."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              disabled={newTitle.trim().length < 3 || create.isPending}
              onClick={() =>
                create.mutate(
                  {
                    title: newTitle.trim(),
                    description: newDescription.trim(),
                    isPublished: true,
                  },
                  {
                    onSuccess: () => {
                      setCreating(false);
                      setNewTitle("");
                      setNewDescription("");
                    },
                  },
                )
              }
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
