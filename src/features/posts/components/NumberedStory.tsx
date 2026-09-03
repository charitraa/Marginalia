import { Link } from "react-router-dom";
import CategoryBadge from "@/features/posts/components/CategoryBadge";
import PostMeta from "@/features/posts/components/PostMeta";
import UserAvatar from "@/features/users/components/UserAvatar";
import { authorPath, postPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Post } from "@/features/posts/types";

interface NumberedStoryProps {
  post: Post;
  /** 1-based position. Rendered as 01, 02, 03 — a rank, not a bullet. */
  rank: number;
  /** "lead" is used for the top of a ranking; "list" for everything under it. */
  variant?: "lead" | "list";
  className?: string;
}

/**
 * A story in a ranking.
 *
 * The number is set in the margin beside the title rather than behind it, so it
 * reads as a position in a list — which is information — instead of as a
 * decorative watermark. Used wherever the API has actually ordered stories by
 * something: trending, and the popular section on the home page.
 */
export default function NumberedStory({
  post,
  rank,
  variant = "list",
  className,
}: NumberedStoryProps) {
  const href = postPath(post);
  const label = String(rank).padStart(2, "0");

  if (variant === "lead") {
    return (
      <article className={cn("group border-t border-foreground/15 pt-8", className)}>
        {/* The image column only exists when there is an image; a story without
            a cover uses the full measure rather than leaving a gap. */}
        <div
          className={cn(
            "grid gap-8 lg:gap-10",
            post.coverImage
              ? "lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,20rem)]"
              : "lg:grid-cols-[auto_minmax(0,1fr)]",
          )}
        >
          <span
            aria-hidden="true"
            className="font-serif text-5xl font-semibold leading-none tabular-nums text-primary/60 transition-colors duration-200 group-hover:text-primary lg:text-6xl"
          >
            {label}
          </span>

          <div className="min-w-0">
            {post.category && <CategoryBadge category={post.category} className="mb-3" />}
            <h3 className="font-serif text-3xl font-semibold sm:text-4xl">
              <Link to={href} className="transition-colors duration-200 hover:text-primary">
                {post.title}
              </Link>
            </h3>
            {post.excerpt && (
              <p className="mt-4 line-clamp-2 max-w-measure font-sans text-base leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex min-w-0 items-center gap-2">
                <UserAvatar user={post.author} size="sm" />
                <Link
                  to={authorPath(post.author)}
                  className="truncate font-sans text-xs text-foreground transition-colors hover:text-primary"
                >
                  {post.author.name}
                </Link>
              </div>
              <PostMeta post={post} />
            </div>
          </div>

          {post.coverImage && (
            <Link
              to={href}
              tabIndex={-1}
              aria-hidden="true"
              className="media-frame hidden aspect-[4/3] w-full self-start lg:block"
            >
              <img src={post.coverImage} alt="" loading="lazy" decoding="async" />
            </Link>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group border-t border-border py-6", className)}>
      <div className="flex gap-6">
        <span
          aria-hidden="true"
          className="shrink-0 font-serif text-3xl font-semibold leading-none tabular-nums text-foreground/20 transition-colors duration-200 group-hover:text-primary/60"
        >
          {label}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-xl font-semibold">
            <Link to={href} className="transition-colors duration-200 hover:text-primary">
              {post.title}
            </Link>
          </h3>
          <p className="mt-1.5 font-sans text-xs text-muted-foreground">{post.author.name}</p>
          <PostMeta post={post} className="mt-2.5" />
        </div>
      </div>
    </article>
  );
}
