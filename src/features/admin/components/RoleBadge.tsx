import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/features/users/types";

/** Human wording and emphasis for each role, so staff read the same labels everywhere. */
const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  moderator: "Moderator",
  author: "Author",
  contributor: "Contributor",
  member: "Member",
  user: "User",
};

// Authority reads as weight, not colour alone, so the ranking survives
// greyscale and colour-blindness.
const ROLE_TONE: Record<Role, string> = {
  super_admin: "border-primary/40 bg-primary/10 text-primary font-semibold",
  admin: "border-primary/30 bg-primary/5 text-primary font-medium",
  editor: "border-border bg-accent font-medium",
  moderator: "border-border bg-accent font-medium",
  author: "border-border bg-transparent",
  contributor: "border-border bg-transparent",
  member: "border-dashed border-border bg-transparent text-muted-foreground",
  user: "border-dashed border-border bg-transparent text-muted-foreground",
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role;
}

export default function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", ROLE_TONE[role], className)}>
      {roleLabel(role)}
    </Badge>
  );
}
