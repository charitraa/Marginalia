import { useState } from "react";
import { Link } from "react-router-dom";
import { Flag, Heart, MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import UserAvatar from "@/features/users/components/UserAvatar";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ReportCommentDialog from "@/features/comments/components/ReportCommentDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatRelative } from "@/lib/format";
import { authorPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Comment } from "@/features/comments/types";

interface CommentItemProps {
  comment: Comment;
  onUpdate: (id: string, content: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onLike?: (id: string, liked: boolean) => void;
  onPin?: (id: string, pinned: boolean) => void;
  busy?: boolean;
  depth?: number;
}

/**
 * A single comment. Edit and delete are offered only for the reader's own
 * comments; the API enforces the same rule regardless of what is shown.
 */
export default function CommentItem({
  comment,
  onUpdate,
  onDelete,
  onLike,
  onPin,
  busy = false,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isOwn =
    Boolean(user) &&
    (user!.id === comment.author.id ||
      (Boolean(comment.author.username) && user!.username === comment.author.username) ||
      user!.name === comment.author.name);

  const edited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      setDraft(comment.content);
      return;
    }
    await onUpdate(comment.id, trimmed);
    setIsEditing(false);
  };

  return (
    <article className={depth > 0 ? "ml-6 border-l border-border pl-4 sm:ml-11" : undefined}>
      <div className="flex gap-3">
        <UserAvatar user={comment.author} size="sm" className="mt-0.5 shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={authorPath(comment.author)}
                className="text-sm font-medium hover:underline"
              >
                {comment.author.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                <time dateTime={comment.createdAt ?? undefined}>
                  {formatRelative(comment.createdAt)}
                </time>
                {edited && <span className="ml-1">· edited</span>}
                {comment.isPinned && (
                  <span className="ml-1 inline-flex items-center gap-1 font-medium text-foreground">
                    · <Pin className="h-3 w-3" aria-hidden="true" /> Pinned
                  </span>
                )}
              </p>
            </div>

            {!isOwn && user && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground"
                    aria-label="Comment options"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.canPin && onPin && (
                    <DropdownMenuItem
                      onSelect={() => onPin(comment.id, !comment.isPinned)}
                      className="gap-2"
                    >
                      {comment.isPinned ? (
                        <>
                          <PinOff className="h-4 w-4" aria-hidden="true" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4" aria-hidden="true" />
                          Pin to top
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => setReportOpen(true)} className="gap-2">
                    <Flag className="h-4 w-4" aria-hidden="true" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isOwn && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground"
                    aria-label="Comment options"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.canPin && onPin && (
                    <DropdownMenuItem
                      onSelect={() => onPin(comment.id, !comment.isPinned)}
                      className="gap-2"
                    >
                      {comment.isPinned ? (
                        <>
                          <PinOff className="h-4 w-4" aria-hidden="true" />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4" aria-hidden="true" />
                          Pin to top
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => setIsEditing(true)} className="gap-2">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setConfirmOpen(true)}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="mt-3 space-y-3">
              <label htmlFor={`edit-${comment.id}`} className="sr-only">
                Edit your comment
              </label>
              <Textarea
                id={`edit-${comment.id}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                className="resize-y"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={save} disabled={busy || !draft.trim()}>
                  {busy ? "Saving…" : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setDraft(comment.content);
                  }}
                  disabled={busy}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-foreground/90">
                {comment.content}
              </p>

              {onLike && (
                <button
                  type="button"
                  onClick={() => user && onLike(comment.id, !comment.isLiked)}
                  disabled={!user}
                  aria-pressed={comment.isLiked}
                  aria-label={comment.isLiked ? "Unlike this comment" : "Like this comment"}
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-colors",
                    user ? "hover:bg-accent" : "cursor-default",
                    comment.isLiked ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Heart
                    className={cn("h-3.5 w-3.5", comment.isLiked && "fill-current")}
                    aria-hidden="true"
                  />
                  {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                </button>
              )}
            </>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-6 space-y-6">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onLike={onLike}
                  busy={busy}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ReportCommentDialog
        commentId={comment.id}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this comment?"
        description="This action cannot be undone."
        loading={busy}
        onConfirm={async () => {
          await onDelete(comment.id);
          setConfirmOpen(false);
        }}
      />
    </article>
  );
}
