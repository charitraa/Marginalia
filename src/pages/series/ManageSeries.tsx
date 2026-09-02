import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, Layers, Plus, Trash2, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSeries, useSeriesMutations } from "@/features/series/hooks/useSeries";
import { useMyPosts } from "@/features/posts/hooks/usePosts";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Build and rearrange a series.
 *
 * Reordering sends the whole running order rather than a move instruction, so
 * a half-applied order is impossible even if a request is retried.
 */
export default function ManageSeries() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: series, isLoading, isError, error, refetch } = useSeries(slug);
  const { update, remove, addPost, removePost, reorder } = useSeriesMutations(slug);
  const { data: myPosts } = useMyPosts({ pageSize: 50 });

  const [pick, setPick] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-page max-w-3xl space-y-4 py-10">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  }

  if (isError || !series) {
    return (
      <Layout>
        <div className="container-page py-16">
          <ErrorState error={error} title="We couldn't load that series." onRetry={() => refetch()} />
        </div>
      </Layout>
    );
  }

  const isOwner = user && (series.author.id === user.id || user.canEditOthers);
  if (!isOwner) {
    return (
      <Layout>
        <div className="container-page py-16 text-center">
          <h1 className="font-serif text-2xl font-bold">Not your series</h1>
          <Button asChild className="mt-6">
            <Link to={`/series/${series.slug}`}>View it instead</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const order = series.entries.map((entry) => entry.post.slug);

  const move = (index: number, direction: -1 | 1) => {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next);
  };

  // Only offer posts that are not already part of this series.
  const inSeries = new Set(order);
  const candidates = (myPosts?.items ?? []).filter((post) => !inSeries.has(post.slug));

  return (
    <Layout>
      <Seo title={`Managing: ${series.title}`} noIndex />

      <div className="container-page max-w-3xl py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" aria-hidden="true" />
              Managing series
            </p>
            <h1 className="font-serif text-3xl font-bold">{series.title}</h1>
          </div>
          <Button variant="outline" asChild>
            <Link to={`/series/${series.slug}`}>View series</Link>
          </Button>
        </header>

        {/* Details */}
        <section className="surface-card mb-8 space-y-4 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Details
          </h2>

          <div className="space-y-2">
            <Label htmlFor="series-title">Title</Label>
            <Input
              id="series-title"
              value={title ?? series.title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="series-description">Description</Label>
            <Textarea
              id="series-description"
              rows={3}
              value={description ?? series.description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium">Published</p>
              <p className="text-xs text-muted-foreground">
                An unpublished series is visible only to you.
              </p>
            </div>
            <Switch
              checked={series.isPublished}
              onCheckedChange={(checked) =>
                update.mutate({
                  target: series.slug,
                  input: {
                    title: title ?? series.title,
                    description: description ?? series.description,
                    isPublished: checked,
                  },
                })
              }
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete series
            </Button>
            <Button
              disabled={update.isPending || (title === null && description === null)}
              onClick={() =>
                update.mutate({
                  target: series.slug,
                  input: {
                    title: title ?? series.title,
                    description: description ?? series.description,
                    isPublished: series.isPublished,
                  },
                })
              }
            >
              Save details
            </Button>
          </div>
        </section>

        {/* Parts */}
        <section className="surface-card space-y-4 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Parts
          </h2>

          {series.entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No parts yet. Add one of your posts below.
            </p>
          ) : (
            <ol className="space-y-2">
              {series.entries.map((entry, index) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <span className="w-6 shrink-0 text-sm tabular-nums text-muted-foreground">
                    {String(entry.position).padStart(2, "0")}
                  </span>
                  <Link
                    to={`/post/${entry.post.slug}`}
                    className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                  >
                    {entry.post.title}
                  </Link>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      aria-label={`Move "${entry.post.title}" up`}
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      aria-label={`Move "${entry.post.title}" down`}
                      disabled={index === series.entries.length - 1 || reorder.isPending}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      aria-label={`Remove "${entry.post.title}" from the series`}
                      disabled={removePost.isPending}
                      onClick={() => removePost.mutate(entry.post.slug)}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Select value={pick} onValueChange={setPick}>
              <SelectTrigger className="min-w-56 flex-1" aria-label="Choose a post to add">
                <SelectValue placeholder={
                  candidates.length ? "Choose one of your posts" : "No other posts available"
                } />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((post) => (
                  <SelectItem key={post.id} value={post.slug}>
                    {post.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="gap-2"
              disabled={!pick || addPost.isPending}
              onClick={() => {
                addPost.mutate(pick);
                setPick("");
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add part
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete “${series.title}”?`}
        description="The series is removed. The posts inside it are not deleted and stay published."
        confirmLabel="Delete series"
        destructive
        loading={remove.isPending}
        onConfirm={() => {
          remove.mutate(series.slug, { onSuccess: () => navigate("/series") });
          setConfirmDelete(false);
        }}
      />
    </Layout>
  );
}
