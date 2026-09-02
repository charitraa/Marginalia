/** Comment threads, and the reasons a reader can flag one. */

import type { Author } from "@/features/users/types";

export interface Comment {
  id: string;
  content: string;
  author: Author;
  parentId: string | null;
  isEdited: boolean;
  /** Server's view of whether the current user may edit. UX only — the API re-checks. */
  canEdit: boolean;
  /** Whether the viewer may pin this comment (post author or moderator). */
  canPin: boolean;
  isPinned: boolean;
  likeCount: number;
  isLiked: boolean;
  /** Moderated out of public threads. Kept so a moderator can still see it. */
  isHidden: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  replies: Comment[];
}

export type ReportReason = "spam" | "abuse" | "off_topic" | "other";

/** How a thread is ordered. Pinned comments float to the top of all three. */
export type CommentSort = "newest" | "oldest" | "popular";
