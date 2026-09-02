import { useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToggleBookmark } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/blog";

/**
 * Save-for-later toggle. Guests are offered a sign-in rather than a control
 * that cannot work, matching how LikeButton treats them.
 */
export default function BookmarkButton({
  post,
  size = "default",
  showLabel = false,
}: {
  post: Post;
  size?: "default" | "sm";
  showLabel?: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toggle = useToggleBookmark(post);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast("Sign in to save this story.", {
        action: { label: "Sign in", onClick: () => navigate("/login") },
      });
      return;
    }
    toggle.mutate(!post.isBookmarked);
  };

  const label = post.isBookmarked ? "Remove from your reading list" : "Save to your reading list";

  return (
    <Button
      variant="ghost"
      size={showLabel ? size : "icon"}
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={post.isBookmarked}
      aria-label={label}
      title={label}
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground",
        post.isBookmarked && "text-primary hover:text-primary",
      )}
    >
      <Bookmark
        className={cn("h-[1.1rem] w-[1.1rem]", post.isBookmarked && "fill-current")}
        aria-hidden="true"
      />
      {showLabel && <span className="text-sm">{post.isBookmarked ? "Saved" : "Save"}</span>}
    </Button>
  );
}
