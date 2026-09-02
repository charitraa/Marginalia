/** In-app notifications. */

import type { Author } from "@/features/users/types";

export type NotificationVerb = "like" | "comment" | "reply" | "follow";

export interface AppNotification {
  id: string;
  verb: NotificationVerb;
  actor: Author;
  /** Sentence built server-side, so the wording lives in one place. */
  message: string;
  /** In-app path to open when the notification is clicked. */
  url: string;
  postTitle: string;
  isRead: boolean;
  createdAt: string | null;
}
