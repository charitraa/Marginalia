import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import * as topicService from "@/features/users/api/topicService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { TopicKind } from "@/features/users/api/topicService";

/**
 * Follow a category or tag.
 *
 * Follow state comes from the reader's own topic list rather than a per-topic
 * request, so a page showing eight tags still costs one query.
 */
export default function TopicFollowButton({
  kind,
  slug,
  name,
  size = "sm",
}: {
  kind: TopicKind;
  slug: string;
  name: string;
  size?: "sm" | "default";
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["topics", "following"],
    queryFn: topicService.listFollowedTopics,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const isFollowing = Boolean(
    data?.items.some((topic) => topic.kind === kind && topic.slug === slug),
  );

  const toggle = useMutation({
    mutationFn: (next: boolean) => topicService.setTopicFollow(kind, slug, next),
    onSuccess: (state) => {
      toast.success(state.isFollowing ? `Following ${name}.` : `Unfollowed ${name}.`);
      queryClient.invalidateQueries({ queryKey: ["topics", "following"] });
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update that follow.")),
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      toast(`Sign in to follow ${name}.`, {
        action: { label: "Sign in", onClick: () => navigate("/login") },
      });
      return;
    }
    toggle.mutate(!isFollowing);
  };

  return (
    <Button
      type="button"
      size={size}
      variant={isFollowing ? "secondary" : "outline"}
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={isFollowing}
      className={cn("gap-1.5", size === "sm" && "h-7 px-2.5 text-xs")}
    >
      {isFollowing ? (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Following
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Follow
        </>
      )}
    </Button>
  );
}
