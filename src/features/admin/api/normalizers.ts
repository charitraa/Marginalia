import { normalizeAuthor } from "@/features/users/api/normalizers";
import type { Role } from "@/features/users/types";
import type { AdminStats, AdminUser, ModerationReport } from "../types";

type Raw = Record<string, any>;

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function count(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

export function normalizeAdminUser(raw: Raw): AdminUser {
  return {
    id: String(raw.id ?? ""),
    username: text(raw.username),
    name: text(raw.name) || text(raw.username),
    email: text(raw.email),
    role: text(raw.role, "user") as Role,
    isActive: Boolean(raw.is_active),
    isVerified: Boolean(raw.is_verified),
    // The API distinguishes "flagged as suspended" from "suspended right now",
    // because a timed suspension lapses without anything having to run.
    isSuspended: Boolean(raw.is_currently_suspended ?? raw.is_suspended),
    suspensionReason: text(raw.suspension_reason),
    suspendedUntil: raw.suspended_until ?? null,
    joinedAt: raw.date_joined ?? null,
    postCount: count(raw.post_count),
  };
}

export function normalizeAdminStats(raw: Raw): AdminStats {
  return {
    totalUsers: num(raw.total_users),
    newUsersThisWeek: num(raw.new_users_this_week),
    suspendedUsers: num(raw.suspended_users),
    totalPosts: num(raw.total_posts),
    publishedPosts: num(raw.published_posts),
    draftPosts: num(raw.draft_posts),
    totalComments: num(raw.total_comments),
    hiddenComments: num(raw.hidden_comments),
    openReports: num(raw.open_reports),
    totalViews: num(raw.total_views),
    totalLikes: num(raw.total_likes),
    newsletterSubscribers: num(raw.newsletter_subscribers),
    roles: (raw.roles ?? {}) as Record<string, number>,
  };
}

export function normalizeModerationReport(raw: Raw): ModerationReport {
  return {
    id: String(raw.id ?? ""),
    reason: raw.reason ?? "other",
    detail: text(raw.detail),
    status: raw.status ?? "open",
    createdAt: raw.created_at ?? null,
    reporter: normalizeAuthor(raw.reporter),
    commentId: String(raw.comment ?? ""),
    commentContent: text(raw.comment_content),
    commentAuthor: normalizeAuthor(raw.comment_author),
    commentIsHidden: Boolean(raw.comment_is_hidden),
    postSlug: text(raw.post_slug),
    postTitle: text(raw.post_title),
  };
}
