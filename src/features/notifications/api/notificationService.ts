import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import { normalizeNotification } from "./normalizers";
import type { AppNotification } from "@/features/notifications/types";
import type { Paginated } from "@/types/common";

/**
 * The notification inbox.
 *
 * Everything here is scoped to the signed-in user by the API; ids belonging to
 * somebody else are simply ignored server-side rather than rejected, so the
 * client never has to reason about ownership.
 */

export async function listNotifications(
  options: { unreadOnly?: boolean; page?: number } = {},
): Promise<Paginated<AppNotification>> {
  const params: Record<string, string | number> = { page: options.page ?? 1 };
  if (options.unreadOnly) params.unread = "true";

  const { data } = await axiosInstance.get("/api/notifications/", { params });
  return normalizePage(data, normalizeNotification, options.page ?? 1, 20);
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await axiosInstance.get("/api/notifications/unread-count/");
  return typeof data?.unread === "number" ? data.unread : 0;
}

/** Omitting `ids` marks the whole inbox read. */
export async function markRead(ids?: string[]): Promise<number> {
  const { data } = await axiosInstance.post("/api/notifications/read/", ids?.length ? { ids } : {});
  return typeof data?.unread === "number" ? data.unread : 0;
}

export async function dismissNotification(id: string): Promise<void> {
  await axiosInstance.delete(`/api/notifications/${id}/`);
}
