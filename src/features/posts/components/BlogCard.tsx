import { Link } from "react-router-dom";
import UserAvatar from "@/features/users/components/UserAvatar";
import CategoryBadge from "@/features/posts/components/CategoryBadge";
import PostMeta from "@/features/posts/components/PostMeta";
import { formatDate } from "@/lib/format";
import { authorPath, postPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Post } from "@/features/posts/types";

interface BlogCardProps {
  post: Post;
  /** "grid" for the card grid, "row" for the reading feed. */
  variant?: "grid" | "row";
  className?: string;
}

/**
 * The canonical post card.
 *
 * There is no card chrome — no border, no shadow, no filled panel. An article is
 * announced by its image, its topic and its title, separated from its neighbours
 * by a hairline. Both variants share the same data so the feed and the grid
 * never drift apart.
 */
export default function BlogCard({ post, variant = "grid", className }: BlogCardProps) {
  const href = postPath(post);
  const published = formatDate(post.publishedAt);

  const cover = post.coverImage ? (
    <img src={post.coverImage} alt="" loading="lazy" decoding="async" />
  ) : (
    // A missing image becomes a quiet typographic plate rather than a grey void.
    <div
      className="flex h-full w-full items-center justify-center bg-muted"
      aria-hidden="true"
    >
      <span className="font-serif text-3xl text-muted-foreground/40">
        {post.title.slice(0, 1).toUpperCase()}
      </span>
    </div>
  );

  const draftFlag = post.status === "draft" && (
    <span className="font-sans text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      Draft
    </span>
  );

  const byline = (
    <div className="flex min-w-0 items-center gap-2">
      <UserAvatar user={post.author} size="sm" />
      <Link
        to={authorPath(post.author)}
        className="truncate font-sans text-xs text-foreground transition-colors hover:text-primary"
        onClick={(event) => event.stopPropagation()}
      >
        {post.author.name}
      </Link>
      {published && (
        <>
          <span className="text-muted-foreground/50" aria-hidden="true">
            ·
          </span>
          <time
            dateTime={post.publishedAt ?? undefined}
            className="shrink-0 font-sans text-xs text-muted-foreground"
          >
            {published}
          </time>
        </>
      )}
    </div>
  );

  if (variant === "row") {
    return (
      <article className={cn("group border-b border-border py-8 last:border-b-0", className)}>
        <div className="flex gap-6 sm:gap-10">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-2.5 flex flex-wrap items-center gap-3">
              {post.category && <CategoryBadge category={post.category} />}
              {draftFlag}
            </div>

            <h3 className="font-serif text-2xl font-semibold sm:text-3xl">
              <Link to={href} className="transition-colors duration-200 hover:text-primary">
                {post.title}
              </Link>
            </h3>

            {post.excerpt && (
              <p className="mt-3 line-clamp-2 max-w-measure font-sans text-base leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              {byline}
              <PostMeta post={post} className="sm:ml-auto" />
            </div>
          </div>

          <Link
            to={href}
            tabIndex={-1}
            aria-hidden="true"
            className="media-frame hidden aspect-[4/3] w-36 shrink-0 self-start sm:block sm:w-52"
          >
            {cover}
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <Link
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className="media-frame mb-5 block aspect-[3/2]"
      >
        {cover}
      </Link>

      <div className="mb-2.5 flex flex-wrap items-center gap-3">
        {post.category && <CategoryBadge category={post.category} />}
        {draftFlag}
      </div>

      <h3 className="font-serif text-xl font-semibold sm:text-2xl">
        <Link to={href} className="transition-colors duration-200 hover:text-primary">
          {post.title}
        </Link>
      </h3>

      {post.excerpt && (
        <p className="mt-2.5 line-clamp-2 font-sans text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-4">
        {byline}
        <PostMeta post={post} variant="plain" />
      </div>
    </article>
  );
}
