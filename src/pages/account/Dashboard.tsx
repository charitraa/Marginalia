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
    <div className="surface-card p-5">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <p className="mt-4 text-3xl font-semibold tabular-nums">{formatCount(value)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function PostRow({ post, onDelete }: { post: Post; onDelete: (post: Post) => void }) {
  return (
    <article className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              post.status === "published"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
            )}
          >
            {post.status === "published" ? "Published" : "Draft"}
          </span>
          {post.category && (
            <span className="text-xs text-muted-foreground">{post.category.name}</span>
          )}
        </div>

        <h3 className="mt-2 text-lg font-semibold leading-snug">
          <Link to={postPath(post)} className="text-foreground hover:text-primary">
            {post.title}
          </Link>
        </h3>

        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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

export default function Dashboard() {
  const { user } = useAuth();
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

      <div className="container-page py-12 sm:py-16">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl">Your dashboard</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {user ? `Welcome back, ${user.name}.` : "Manage your stories and track how they're doing."}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/write">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Write a story
            </Link>
          </Button>
        </header>

        {/* Overview */}
        <section aria-label="Overview" className="mt-10">
          {stats.isLoading ? (
            <StatsSkeleton count={4} />
          ) : stats.error ? (
            <ErrorState
              error={stats.error}
              title="We couldn't load your statistics."
              onRetry={() => stats.refetch()}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="flex gap-6" role="tablist">
              {TABS.map((entry) => (
                <button
                  key={entry.id}
                  role="tab"
                  aria-selected={activeTab.id === entry.id}
                  onClick={() => setTab(entry.id)}
                  className={cn(
                    "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
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
                <div className="space-y-4">
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
