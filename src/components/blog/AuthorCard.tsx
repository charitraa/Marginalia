import { Link } from "react-router-dom";
import UserAvatar from "@/components/blog/UserAvatar";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { authorPath } from "@/lib/routes";
import type { Author } from "@/types/blog";

/** Author summary shown under an article. */
export default function AuthorCard({ author }: { author: Author }) {
  return (
    <aside className="surface-card flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
      <UserAvatar user={author} size="lg" className="shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Written by</p>
        <h2 className="mt-1 text-xl">
          <Link to={authorPath(author)} className="hover:text-primary">
            {author.name}
          </Link>
        </h2>

        {author.headline && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{author.headline}</p>
        )}

        {author.joinedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Joined {formatDate(author.joinedAt)}
          </p>
        )}
      </div>

      <Button asChild variant="outline" className="shrink-0 sm:self-center">
        <Link to={authorPath(author)}>View profile</Link>
      </Button>
    </aside>
  );
}
