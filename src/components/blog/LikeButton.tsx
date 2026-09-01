import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToggleLike } from "@/hooks/usePosts";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/blog";

/**
 * Like toggle backed by the API. The count comes from the server response, so
 * the button never shows a number the backend does not agree with. Guests are
 * sent to sign in rather than being given a control that cannot work.
 */
export default function LikeButton({
  post,
  size = "default",
}: {
  post: Post;
  size?: "default" | "sm";
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toggle = useToggleLike(post);
  const [pulse, setPulse] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast("Sign in to like this story.", {
        action: { label: "Sign in", onClick: () => navigate("/login") },
      });
      return;
    }

    if (!post.isLiked) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 320);
    }
    toggle.mutate(!post.isLiked);
  };

  const label = post.isLiked ? "Unlike this story" : "Like this story";

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={post.isLiked}
      aria-label={label}
      title={label}
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground",
        post.isLiked && "text-primary hover:text-primary",
      )}
    >
      <Heart
        className={cn("h-[1.1rem] w-[1.1rem]", post.isLiked && "fill-current", pulse && "animate-like-pop")}
        aria-hidden="true"
      />
      {post.likeCount != null && <span className="text-sm">{formatCount(post.likeCount)}</span>}
    </Button>
  );
}
