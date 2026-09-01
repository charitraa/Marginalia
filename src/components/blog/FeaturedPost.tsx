import { Link } from "react-router-dom";
import UserAvatar from "@/components/blog/UserAvatar";
import CategoryBadge from "@/components/blog/CategoryBadge";
import PostMeta from "@/components/blog/PostMeta";
import { formatDate } from "@/lib/format";
import { authorPath, postPath } from "@/lib/routes";
import type { Post } from "@/types/blog";

/** The lead story: a wide two-column treatment that stacks on small screens. */
export default function FeaturedPost({ post }: { post: Post }) {
  const href = postPath(post);

  return (
    <article className="group grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
      <Link
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className="block aspect-[16/10] overflow-hidden rounded-lg border border-border"
      >
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt=""
            loading="eager"
            decoding="async"
            className="h-full w-full bg-muted object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="font-serif text-4xl text-muted-foreground/40">
              {post.title.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Featured
          </span>
          {post.category && <CategoryBadge category={post.category} />}
        </div>

        <h2 className="text-3xl leading-tight sm:text-4xl">
          <Link to={href} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="mt-4 line-clamp-3 text-base leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-3">
            <UserAvatar user={post.author} />
            <div className="text-sm">
              <Link to={authorPath(post.author)} className="font-medium hover:underline">
                {post.author.name}
              </Link>
              {post.publishedAt && (
                <p className="text-xs text-muted-foreground">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </p>
              )}
            </div>
          </div>
          <PostMeta post={post} className="sm:ml-2" />
        </div>
      </div>
    </article>
  );
}
