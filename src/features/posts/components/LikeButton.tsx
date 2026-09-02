import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Lightbulb, Smile, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToggleLike } from "@/features/posts/hooks/usePosts";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Post, ReactionKind } from "@/features/posts/types";

/**
 * Reactions.
 *
 * A click reacts with "like" — the common case stays one tap. Holding the
 * popover open offers the others. One reaction per person: picking a different
 * one replaces it, so the count is always "how many people reacted" rather
 * than a total that flatters the post.
 *
 * Guests are offered a sign-in rather than a control that cannot work.
 */

const REACTIONS: Array<{
  kind: ReactionKind;
  label: string;
  icon: typeof Heart;
}> = [
  { kind: "like", label: "Like", icon: ThumbsUp },
  { kind: "love", label: "Love", icon: Heart },
  { kind: "insightful", label: "Insightful", icon: Lightbulb },
  { kind: "funny", label: "Funny", icon: Smile },
];

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
  const [open, setOpen] = useState(false);

  const current = REACTIONS.find((entry) => entry.kind === post.myReaction);
  const Icon = current?.icon ?? Heart;

  const requireSignIn = () => {
    toast("Sign in to react to this story.", {
      action: { label: "Sign in", onClick: () => navigate("/login") },
    });
  };

  const react = (kind: ReactionKind) => {
    if (!isAuthenticated) return requireSignIn();
    // Picking the reaction you already have removes it.
    const removing = post.myReaction === kind;
    if (!removing) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 320);
    }
    toggle.mutate({ liked: !removing, kind });
    setOpen(false);
  };

  const label = post.isLiked
    ? `Remove your ${current?.label.toLowerCase() ?? "reaction"}`
    : "React to this story";

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size={size}
        onClick={() => (isAuthenticated ? react(post.myReaction ?? "like") : requireSignIn())}
        disabled={toggle.isPending}
        aria-pressed={post.isLiked}
        aria-label={label}
        title={label}
        className={cn(
          "gap-2 text-muted-foreground hover:text-foreground",
          post.isLiked && "text-primary hover:text-primary",
        )}
      >
        <Icon
          className={cn(
            "h-[1.1rem] w-[1.1rem]",
            post.isLiked && "fill-current",
            pulse && "animate-like-pop",
          )}
          aria-hidden="true"
        />
        {post.likeCount != null && (
          <span className="text-sm">{formatCount(post.likeCount)}</span>
        )}
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Choose a reaction"
            className="rounded px-1 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            ⌄
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1" align="start">
          <div className="flex gap-0.5" role="group" aria-label="Reactions">
            {REACTIONS.map(({ kind, label: name, icon: ReactionIcon }) => (
              <Button
                key={kind}
                variant="ghost"
                size="icon"
                title={name}
                aria-label={name}
                aria-pressed={post.myReaction === kind}
                onClick={() => react(kind)}
                className={cn(
                  "h-9 w-9",
                  post.myReaction === kind && "bg-accent text-primary",
                )}
              >
                <ReactionIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
