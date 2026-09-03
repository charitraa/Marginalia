import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Eye,
  FileText,
  Heart,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { PostListSkeleton, StatsSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDashboardStats } from "@/features/users/hooks/useUsers";
import { useMyPosts, usePostMutations } from "@/features/posts/hooks/usePosts";
import { formatCount, formatDate } from "@/lib/format";
import { postPath } from "@/lib/routes";
import { pageCount } from "@/lib/api/normalize";
import { cn } from "@/lib/utils";
import type { Post, PostStatus } from "@/features/posts/types";

const TABS: { id: string; label: string; status?: PostStatus }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published", status: "published" },
  { id: "drafts", label: "Drafts", status: "draft" },
];

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3;
  label: string;
  value: number | null;
}) {
  // A stat the API cannot calculate is omitted rather than shown as zero.
  if (value == null) return null;
  return (
    <div className="border-t border-border pt-4">
      <p className="flex items-center gap-1.5 font-sans text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3 w-3" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2.5 font-serif text-4xl font-semibold tabular-nums">{formatCount(value)}</p>
    </div>
  );
}

function PostRow({ post, onDelete }: { post: Post; onDelete: (post: Post) => void }) {
  return (
    <article className="group flex flex-col gap-5 border-b border-border py-6 sm:flex-row sm:items-start">
      <Link
        to={postPath(post)}
        tabIndex={-1}
        aria-hidden="true"
        className="media-frame hidden aspect-[4/3] w-28 shrink-0 sm:block"
      >
        {post.coverImage ? (
          <img src={post.coverImage} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="font-serif text-xl text-muted-foreground/40">
              {post.title.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 font-sans text-2xs font-medium uppercase tracking-[0.14em]",
              post.status === "published" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                post.status === "published" ? "bg-primary" : "bg-muted-foreground/50",
              )}
              aria-hidden="true"
            />
            {post.status === "published" ? "Published" : "Draft"}
          </span>
          {post.category && (
            <span className="font-sans text-2xs uppercase tracking-[0.14em] text-muted-foreground">
              {post.category.name}
            </span>
          )}
        </div>

        <h3 className="mt-2.5 font-serif text-xl font-semibold">
          <Link to={postPath(post)} className="transition-colors duration-200 hover:text-primary">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-2 max-w-measure font-sans text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs tabular-nums text-muted-foreground">
          {post.viewCount != null && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {post.viewCount} views
            </span>
          )}
          {post.likeCount != null && (
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              {post.likeCount} likes
            </span>
          )}
          {post.commentCount != null && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              {post.commentCount} comments
            </span>
          )}
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" className="gap-2" asChild>
          <Link to={`/post/${post.slug}/edit`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-destructive hover:text-destructive"
          onClick={() => onDelete(post)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Delete</span>
        </Button>
      </div>
    </article>
  );
}

/** Local time of day — nothing is fetched for this. */
function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const greeting = greetingFor(new Date().getHours());
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "all";
  const page = Number(params.get("page") ?? 1) || 1;
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);

  const activeTab = TABS.find((entry) => entry.id === tab) ?? TABS[0];
  const stats = useDashboardStats();
  const posts = useMyPosts({ status: activeTab.status, page, pageSize: 10 });
  const { remove } = usePostMutations();

  const setTab = (next: string) => {
    const url = new URLSearchParams(params);
    url.set("tab", next);
    url.delete("page");
    setParams(url);
  };

  const items = posts.data?.items ?? [];

  return (
    <Layout>
      <Seo title="Dashboard" canonicalPath="/dashboard" noIndex />

      <div className="container-page pb-20">
        <PageHeader
          eyebrow="Marginalia / Studio"
          title={
            <>
              {greeting}
              {user ? `, ${user.name.split(" ")[0]}` : ""}.
            </>
          }
          description="Your writing space."
          actions={
            <Button asChild className="gap-2">
              <Link to="/write">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Write a story
              </Link>
            </Button>
          }
        />

        {/* Overview */}
        <section aria-label="Overview" className="mt-12">
          {stats.isLoading ? (
            <StatsSkeleton count={4} />
          ) : stats.error ? (
            <ErrorState
              error={stats.error}
              title="We couldn't load your statistics."
              onRetry={() => stats.refetch()}
            />
          ) : (
            <div className="grid gap-x-8 gap-y-8 grid-cols-2 lg:grid-cols-4">
              <StatCard icon={FileText} label="Total posts" value={stats.data?.totalPosts ?? null} />
              <StatCard icon={BarChart3} label="Published" value={stats.data?.publishedPosts ?? null} />
              <StatCard icon={Pencil} label="Drafts" value={stats.data?.draftPosts ?? null} />
              <StatCard icon={Eye} label="Total views" value={stats.data?.totalViews ?? null} />
              <StatCard icon={Heart} label="Total likes" value={stats.data?.totalLikes ?? null} />
              <StatCard
                icon={MessageSquare}
                label="Total comments"
                value={stats.data?.totalComments ?? null}
              />
              <StatCard icon={Users} label="Followers" value={stats.data?.followerCount ?? null} />
            </div>
          )}
        </section>

        {/* Posts */}
        <section aria-label="Your posts" className="mt-14">
          <div className="border-b border-border">
            <div className="flex gap-7" role="tablist">
              {TABS.map((entry) => (
                <button
                  key={entry.id}
                  role="tab"
                  aria-selected={activeTab.id === entry.id}
                  onClick={() => setTab(entry.id)}
                  className={cn(
                    "-mb-px border-b-2 pb-3 font-sans text-sm transition-colors duration-200",
                    activeTab.id === entry.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {posts.isLoading ? (
              <PostListSkeleton count={3} />
            ) : posts.error ? (
              <ErrorState
                error={posts.error}
                title="We couldn't load your posts."
                onRetry={() => posts.refetch()}
              />
            ) : items.length === 0 ? (
              <EmptyState
                title={
                  activeTab.id === "drafts"
                    ? "No drafts yet."
                    : activeTab.id === "published"
                      ? "Nothing published yet."
                      : "Start writing your first story."
                }
                description="Everything you write shows up here, published or not."
                action={{ label: "Write a story", to: "/write" }}
              />
            ) : (
              <>
                <div className="border-t border-border">
                  {items.map((post) => (
                    <PostRow key={post.id} post={post} onDelete={setPendingDelete} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  pageCount={posts.data ? pageCount(posts.data) : 1}
                  onPageChange={(next) => {
                    const url = new URLSearchParams(params);
                    url.set("page", String(next));
                    setParams(url);
                  }}
                />
              </>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this post?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be removed permanently. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove.mutateAsync(pendingDelete.slug);
          setPendingDelete(null);
        }}
      />
    </Layout>
  );
}
