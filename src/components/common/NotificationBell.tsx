import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarkNotificationsRead, useNotifications, useUnreadCount } from "@/hooks/useNotifications";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Notification bell.
 *
 * The badge is driven by a dedicated count endpoint so it stays cheap; the
 * list itself is only fetched once the menu is opened.
 */
export default function NotificationBell() {
  const { data: unread = 0 } = useUnreadCount();
  const { data: page } = useNotifications(false, 1);
  const markRead = useMarkNotificationsRead();

  const items = page?.items.slice(0, 6) ?? [];
  const badge = unread > 9 ? "9+" : String(unread);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
          {unread > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
              aria-hidden="true"
            >
              {badge}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>Notifications</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markRead.mutate(undefined)}
              disabled={markRead.isPending}
              className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nothing yet. Likes, comments and new followers land here.
          </p>
        ) : (
          items.map((item) => (
            <DropdownMenuItem key={item.id} asChild>
              <Link
                to={item.url}
                onClick={() => !item.isRead && markRead.mutate([item.id])}
                className={cn("flex flex-col items-start gap-0.5", !item.isRead && "bg-accent/50")}
              >
                <span className="text-sm leading-snug">{item.message}</span>
                {item.postTitle && (
                  <span className="line-clamp-1 text-xs text-muted-foreground">{item.postTitle}</span>
                )}
                <span className="text-xs text-muted-foreground">{formatRelative(item.createdAt)}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/notifications" className="justify-center text-sm">
            See all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
