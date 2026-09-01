import { Link } from "react-router-dom";
import UserAvatar from "@/components/blog/UserAvatar";
import CategoryBadge from "@/components/blog/CategoryBadge";
import PostMeta from "@/components/blog/PostMeta";
import { formatDate } from "@/lib/format";
import { authorPath, postPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/blog";

interface BlogCardProps {
  post: Post;
  /** "grid" for the card grid, "row" for the reading feed. */
  variant?: "grid" | "row";
  className?: string;
}

/**
 * The canonical post card. Both variants share the same data so the feed and
 * the grid never drift apart.
 */
export default function BlogCard({ post, variant = "grid", className }: BlogCardProps) {
  const href = postPath(post);
  const published = formatDate(post.publishedAt);

  const cover = post.coverImage ? (
    <img
      src={post.coverImage}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-full w-full bg-muted object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-muted" aria-hidden="true">
      <span className="font-serif text-2xl text-muted-foreground/50">
        {post.title.slice(0, 1).toUpperCase()}
      </span>
    </div>
  );

  const byline = (
    <div className="flex items-center gap-2 text-sm">
      <UserAvatar user={post.author} size="sm" />
      <div className="min-w-0">
        <Link
          to={authorPath(post.author)}
          className="font-medium text-foreground hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {post.author.name}
        </Link>
        {published && (
          <span className="ml-2 text-xs text-muted-foreground">
            <time dateTime={post.publishedAt ?? undefined}>{published}</time>
          </span>
        )}
      </div>
    </div>
  );

  if (variant === "row") {
    return (
      <article className={cn("group flex gap-5 py-6 sm:gap-8", className)}>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {post.category && <CategoryBadge category={post.category} />}
            {post.status === "draft" && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                Draft
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold leading-snug sm:text-2xl">
            <Link to={href} className="transition-colors hover:text-primary">
              {post.title}
            </Link>
          </h3>

          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {byline}
            <PostMeta post={post} className="ml-auto" />
          </div>
        </div>

        <Link
          to={href}
          tabIndex={-1}
          aria-hidden="true"
          className="h-24 w-28 shrink-0 overflow-hidden rounded-lg border border-border sm:h-28 sm:w-44"
        >
          {cover}
        </Link>
      </article>
    );
  }

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <Link
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className="mb-4 block aspect-[16/10] overflow-hidden rounded-lg border border-border"
      >
        {cover}
      </Link>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {post.category && <CategoryBadge category={post.category} />}
        {post.status === "draft" && (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
            Draft
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold leading-snug">
        <Link to={href} className="transition-colors hover:text-primary">
          {post.title}
        </Link>
      </h3>

      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      <div className="mt-auto space-y-3 pt-4">
        {byline}
        <PostMeta post={post} />
      </div>
    </article>
  );
}
