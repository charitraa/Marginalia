import { Link } from "react-router-dom";
import UserAvatar from "@/features/users/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/format";
import { authorPath } from "@/lib/routes";
import type { Author } from "@/features/users/types";

/**
 * Author summary shown under an article.
 *
 * A byline block rather than a card: two rules and the writer's name set in the
 * editorial face, so the article ends on a person instead of a panel.
 */
export default function AuthorCard({ author }: { author: Author }) {
  return (
    <aside className="border-y border-border py-8">
      <p className="eyebrow">Written by</p>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Link to={authorPath(author)} className="shrink-0">
          <UserAvatar user={author} size="lg" />
        </Link>

        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-2xl font-semibold">
            <Link to={authorPath(author)} className="transition-colors duration-200 hover:text-primary">
              {author.name}
            </Link>
          </h2>

          {author.headline && (
            <p className="mt-2 max-w-measure font-sans text-sm leading-relaxed text-muted-foreground">
              {author.headline}
            </p>
          )}

          {(author.postCount != null || author.followerCount != null) && (
            <p className="mt-3 font-sans text-xs tabular-nums text-muted-foreground">
              {author.postCount != null && (
                <span>
                  {formatCount(author.postCount)} {author.postCount === 1 ? "article" : "articles"}
                </span>
              )}
              {author.postCount != null && author.followerCount != null && (
                <span aria-hidden="true"> · </span>
              )}
              {author.followerCount != null && (
                <span>{formatCount(author.followerCount)} followers</span>
              )}
            </p>
          )}
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0 self-start">
          <Link to={authorPath(author)}>View profile</Link>
        </Button>
      </div>
    </aside>
  );
}
