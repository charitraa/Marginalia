import { useState } from "react";
import { Link } from "react-router-dom";
import { CornerDownRight, Flag, Heart, MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
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

// Same shape the server parses, so what is highlighted is what was notified.
const MENTION_RE = /(?<![\w@])@([a-zA-Z0-9_-]{3,30})\b/g;

/**
 * Turns @handles into profile links.
 *
 * Built as React nodes rather than injected HTML: comment bodies are untrusted
 * text, and the one thing that must never happen is a comment becoming markup.
 */
function renderMentions(text: string) {
  const parts: Array<string | JSX.Element> = [];
  let cursor = 0;

  for (const match of text.matchAll(MENTION_RE)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <Link
        key={`${match[1]}-${start}`}
        to={`/author/${match[1]}`}
        className="font-medium text-primary hover:underline"
      >
        @{match[1]}
      </Link>,
    );
    cursor = start + match[0].length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length ? parts : text;
}

interface CommentItemProps {
  comment: Comment;
  onUpdate: (id: string, content: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  onLike?: (id: string, liked: boolean) => void;
  onPin?: (id: string, pinned: boolean) => void;
  /** Posts a reply against this thread. Absent for signed-out readers. */
  onReply?: (parentId: string, content: string) => Promise<unknown>;
  replying?: boolean;
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
  onReply,
  replying = false,
  busy = false,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");

  const isOwn =
    Boolean(user) &&
    (user!.id === comment.author.id ||
      (Boolean(comment.author.username) && user!.username === comment.author.username) ||
      user!.name === comment.author.name);

  const edited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  /**
   * A reply always attaches to the top of its thread, matching how the API
   * returns them — replies nested inside their parent, one level deep.
   */
  const sendReply = async () => {
    const trimmed = replyDraft.trim();
    if (!trimmed || !onReply) return;
    await onReply(comment.parentId ?? comment.id, trimmed);
    setReplyDraft("");
    setReplyOpen(false);
  };

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
    <article className={depth > 0 ? "ml-6 mt-6 border-l border-border pl-5 sm:ml-11" : "py-7"}>
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
                {renderMentions(comment.content)}
              </p>

              <div className="mt-2 -ml-1.5 flex items-center gap-1">
                {onLike && (
                  <button
                    type="button"
                    onClick={() => user && onLike(comment.id, !comment.isLiked)}
                    disabled={!user}
                    aria-pressed={comment.isLiked}
                    aria-label={comment.isLiked ? "Unlike this comment" : "Like this comment"}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-colors duration-200",
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

                {onReply && user && (
                  <button
                    type="button"
                    onClick={() => setReplyOpen((open) => !open)}
                    aria-expanded={replyOpen}
                    className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                  >
                    <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                    Reply
                  </button>
                )}
              </div>

              {replyOpen && onReply && (
                <div className="mt-4 border-l border-border pl-4">
                  <label htmlFor={`reply-${comment.id}`} className="sr-only">
                    Reply to {comment.author.name}
                  </label>
                  <Textarea
                    id={`reply-${comment.id}`}
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value.slice(0, 1000))}
                    rows={3}
                    autoFocus
                    placeholder={`Reply to ${comment.author.name}…`}
                    className="resize-y bg-transparent"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" onClick={sendReply} disabled={replying || !replyDraft.trim()}>
                      {replying ? "Posting…" : "Post reply"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={replying}
                      onClick={() => {
                        setReplyOpen(false);
                        setReplyDraft("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
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
                  onReply={onReply}
                  replying={replying}
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
