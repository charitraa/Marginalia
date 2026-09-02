import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as notificationService from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";

/**
 * Notification inbox and unread badge.
 *
 * The badge polls on a slow interval rather than opening a socket: a blog does
 * not need real-time delivery, and one small request a minute costs far less
 * than keeping a connection alive for every reader.
 */

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (unreadOnly: boolean, page: number) => ["notifications", "list", unreadOnly, page] as const,
  unread: ["notifications", "unread"] as const,
};

const UNREAD_POLL_MS = 60_000;

export function useUnreadCount() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: notificationKeys.unread,
    queryFn: notificationService.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? UNREAD_POLL_MS : false,
    // A background tab does not need to keep polling.
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}

export function useNotifications(unreadOnly = false, page = 1) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: notificationKeys.list(unreadOnly, page),
    queryFn: () => notificationService.listNotifications({ unreadOnly, page }),
    enabled: isAuthenticated,
    placeholderData: (previous) => previous,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: string[]) => notificationService.markRead(ids),
    onSuccess: (unread) => {
      // The server's count is authoritative; the list refetches behind it.
      queryClient.setQueryData(notificationKeys.unread, unread);
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.dismissNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
