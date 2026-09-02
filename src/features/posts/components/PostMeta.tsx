import { Heart, MessageCircle } from "lucide-react";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Post } from "@/features/posts/types";

interface PostMetaProps {
  post: Post;
  className?: string;
  /**
   * "counts" shows likes and comments with icons — for cards and lists.
   * "plain" shows reading time alone, for places where engagement is noise.
   */
  variant?: "counts" | "plain";
}

/**
 * Reading time plus engagement counts. Counts the API does not provide are
 * omitted rather than rendered as zero, so a quiet post does not advertise it.
 */
export default function PostMeta({ post, className, variant = "counts" }: PostMetaProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 font-sans text-xs tabular-nums text-muted-foreground",
        className,
      )}
    >
      <span>{post.readingTime} min read</span>

      {variant === "counts" && post.likeCount != null && (
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only">Likes:</span>
          {formatCount(post.likeCount)}
        </span>
      )}

      {variant === "counts" && post.commentCount != null && (
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only">Comments:</span>
          {formatCount(post.commentCount)}
        </span>
      )}
    </div>
  );
}
