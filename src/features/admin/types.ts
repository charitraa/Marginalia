/**
 * Administration: the staff-only view of accounts, site totals and the
 * moderation queue.
 *
 * Everything here is gated by a capability on the signed-in user, and every
 * endpoint re-checks it — these types describe what staff may *see*, not what
 * the client is trusted to decide.
 */

import type { Author, Role } from "@/features/users/types";
import type { ReportReason } from "@/features/comments/types";

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  /** True only while a suspension is actually in force; a timed one expires. */
  isSuspended: boolean;
  suspensionReason: string;
  suspendedUntil: string | null;
  joinedAt: string | null;
  postCount: number | null;
}

export interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  suspendedUsers: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  hiddenComments: number;
  openReports: number;
  totalViews: number;
  totalLikes: number;
  newsletterSubscribers: number;
  /** Head count per role, for the breakdown on the dashboard. */
  roles: Record<string, number>;
}

export type ReportStatus = "open" | "reviewed" | "dismissed";

export interface ModerationReport {
  id: string;
  reason: ReportReason;
  detail: string;
  status: ReportStatus;
  createdAt: string | null;
  reporter: Author;
  commentId: string;
  commentContent: string;
  commentAuthor: Author;
  commentIsHidden: boolean;
  postSlug: string;
  postTitle: string;
}

export type ModerationAction = "hide" | "unhide" | "dismiss";
