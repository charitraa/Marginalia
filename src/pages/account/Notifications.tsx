import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import UserAvatar from "@/features/users/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDismissNotification,
  useMarkNotificationsRead,
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks/useNotifications";
import { pageCount } from "@/lib/api/normalize";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The full notification inbox, with an unread filter. */
export default function Notifications() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications(unreadOnly, page);
  const { data: unread = 0 } = useUnreadCount();
  const markRead = useMarkNotificationsRead();
  const dismiss = useDismissNotification();

  const items = data?.items ?? [];

  return (
    <Layout>
      <Seo title="Notifications" noIndex />

      <div className="container-page max-w-3xl py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>

          {unread > 0 && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => markRead.mutate(undefined)}
              disabled={markRead.isPending}
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Mark all read
            </Button>
          )}
        </div>

        <Tabs
          value={unreadOnly ? "unread" : "all"}
          onValueChange={(value) => {
            setUnreadOnly(value === "unread");
            setPage(1);
          }}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-10 w-10" />}
            title={unreadOnly ? "Nothing unread" : "No notifications yet"}
            description="Likes, comments and new followers will show up here."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn("flex items-start gap-3 p-4", !item.isRead && "bg-accent/40")}
              >
                <UserAvatar user={item.actor} size="sm" />

                <Link
                  to={item.url}
                  onClick={() => !item.isRead && markRead.mutate([item.id])}
                  className="min-w-0 flex-1"
                >
                  <p className="text-sm leading-snug">{item.message}</p>
                  {item.postTitle && (
                    <p className="line-clamp-1 text-sm text-muted-foreground">{item.postTitle}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelative(item.createdAt)}
                  </p>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Dismiss this notification"
                  onClick={() => dismiss.mutate(item.id)}
                  disabled={dismiss.isPending}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {data && pageCount(data) > 1 && (
          <Pagination
            className="mt-8"
            page={page}
            pageCount={pageCount(data)}
            onPageChange={setPage}
          />
        )}
      </div>
    </Layout>
  );
}
