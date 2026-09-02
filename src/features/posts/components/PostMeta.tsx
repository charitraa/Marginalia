import { Heart, MessageCircle } from "lucide-react";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Post } from "@/features/posts/types";

/**
 * Reading time plus engagement counts. Counts the API does not provide are
 * omitted rather than rendered as zero.
 */
export default function PostMeta({ post, className }: { post: Post; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 text-xs text-muted-foreground",
        className,
      )}
    >
      <span>{post.readingTime} min read</span>

      {post.likeCount != null && (
        <span className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Likes:</span>
          {formatCount(post.likeCount)}
        </span>
      )}

      {post.commentCount != null && (
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Comments:</span>
          {formatCount(post.commentCount)}
        </span>
      )}
    </div>
  );
}
