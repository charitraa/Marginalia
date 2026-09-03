import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import * as postService from "@/features/posts/api/postService";
import { postKeys } from "@/features/posts/api/queryKeys";
import { formatRelative } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

/**
 * A post's edit history, with a read-only view of any version and a restore.
 *
 * Restoring is safe rather than destructive: the server snapshots the current
 * text first, so the version you replaced is itself recoverable.
 */
export default function RevisionHistory({
  slug,
  open,
  onOpenChange,
}: {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["revisions", slug],
    queryFn: () => postService.listRevisions(slug),
    enabled: open,
  });

  const { data: selected } = useQuery({
    queryKey: ["revision", slug, selectedId],
    queryFn: () => postService.getRevision(slug, selectedId as string),
    enabled: Boolean(open && selectedId),
  });

  const restore = useMutation({
    mutationFn: (id: string) => postService.restoreRevision(slug, id),
    onSuccess: () => {
      toast.success("Version restored. The text you replaced was saved too.");
      queryClient.invalidateQueries({ queryKey: postKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: ["revisions", slug] });
      onOpenChange(false);
    },
    onError: (error) => toast.error(errorMessage(error, "Could not restore that version.")),
  });

  const revisions = data?.items ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" aria-hidden="true" />
              Version history
            </DialogTitle>
            <DialogDescription>
              Every edit is saved. Restoring one keeps the current text as a version too.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : revisions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No earlier versions yet — they appear once you edit a saved post.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[16rem_1fr]">
              <ScrollArea className="h-72 rounded-md border border-border">
                <ul className="divide-y divide-border">
                  {revisions.map((revision) => (
                    <li key={revision.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(revision.id)}
                        className={cn(
                          "w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent",
                          selectedId === revision.id && "bg-accent",
                        )}
                      >
                        <span className="line-clamp-1 font-medium">{revision.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatRelative(revision.createdAt)} · {revision.wordCount} words
                        </span>
                        {revision.note && (
                          <span className="block text-xs italic text-muted-foreground">
                            {revision.note}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>

              <div className="min-w-0">
                {selected ? (
                  <>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-serif text-lg font-semibold">
                          {selected.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelative(selected.createdAt)}
                          {selected.createdBy && ` · ${selected.createdBy.name}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-2"
                        onClick={() => setConfirmRestore(selected.id)}
                        disabled={restore.isPending}
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Restore
                      </Button>
                    </div>
                    <ScrollArea className="h-56 rounded-md border border-border p-3">
                      <div
                        className="article-content text-sm"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(selected.content) }}
                      />
                    </ScrollArea>
                  </>
                ) : (
                  <p className="flex h-72 items-center justify-center text-center text-sm text-muted-foreground">
                    Pick a version to read it.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmRestore)}
        onOpenChange={(next) => !next && setConfirmRestore(null)}
        title="Restore this version?"
        description="Your current text will be saved as a version first, so you can undo this."
        confirmLabel="Restore"
        loading={restore.isPending}
        onConfirm={() => {
          if (confirmRestore) restore.mutate(confirmRestore);
          setConfirmRestore(null);
        }}
      />
    </>
  );
}
