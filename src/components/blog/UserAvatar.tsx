import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Author } from "@/types/blog";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

interface UserAvatarProps {
  user: Pick<Author, "name" | "avatar">;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Initials stand in whenever an avatar is missing or fails to load. */
export default function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  return (
    <Avatar className={cn(SIZES[size], "border border-border", className)}>
      {user.avatar && <AvatarImage src={user.avatar} alt="" loading="lazy" />}
      <AvatarFallback className="bg-muted font-medium text-muted-foreground">
        {initialsOf(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}
