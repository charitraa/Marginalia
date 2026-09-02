import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import UserAvatar from "@/features/users/components/UserAvatar";
import CategoryBadge from "@/features/posts/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { authorPath, postPath } from "@/lib/routes";
import type { Post } from "@/features/posts/types";

/**
 * The lead story.
 *
 * Deliberately outsized against the cards below it: a tall image and a title set
 * two steps up the scale, so a reader arriving on the home page is in no doubt
 * about what the publication wants them to read first.
 */
export default function FeaturedPost({ post }: { post: Post }) {
  const href = postPath(post);

  return (
    <article className="group grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="media-frame block aspect-[5/4]">
        {post.coverImage ? (
          <img src={post.coverImage} alt="" loading="eager" decoding="async" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="font-serif text-6xl text-muted-foreground/40">
              {post.title.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      <div className="min-w-0">
        {post.category && <CategoryBadge category={post.category} className="mb-4" />}

        <h2 className="font-serif text-4xl font-semibold sm:text-5xl">
          <Link to={href} className="transition-colors duration-200 hover:text-primary">
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="mt-5 line-clamp-3 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-sans text-sm">
          <UserAvatar user={post.author} size="sm" />
          <Link
            to={authorPath(post.author)}
            className="text-foreground transition-colors hover:text-primary"
          >
            {post.author.name}
          </Link>
          {post.publishedAt && (
            <>
              <span className="text-muted-foreground/50" aria-hidden="true">·</span>
              <time dateTime={post.publishedAt} className="text-muted-foreground">
                {formatDate(post.publishedAt)}
              </time>
            </>
          )}
          <span className="text-muted-foreground/50" aria-hidden="true">·</span>
          <span className="text-muted-foreground">{post.readingTime} min read</span>
        </div>

        <Button asChild variant="outline" className="mt-8 gap-2">
          <Link to={href}>
            Read article
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 ease-editorial group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </div>
    </article>
  );
}
