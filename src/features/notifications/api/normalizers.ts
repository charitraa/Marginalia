import { text, type Raw } from "@/lib/api/normalize";
import { normalizeAuthor } from "@/features/users/api/normalizers";
import type { AppNotification, NotificationVerb } from "../types";

const VERBS: NotificationVerb[] = ["like", "comment", "reply", "follow"];

export function normalizeNotification(raw: Raw): AppNotification {
  return {
    id: String(raw.id ?? ""),
    verb: VERBS.includes(raw.verb) ? raw.verb : "like",
    actor: normalizeAuthor(raw.actor),
    message: text(raw.message, "You have a new notification"),
    // Falls back to the home page rather than rendering a dead link.
    url: text(raw.url, "/"),
    postTitle: text(raw.post_title),
    isRead: Boolean(raw.is_read),
    createdAt: raw.created_at ?? null,
  };
}
