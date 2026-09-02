import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Copy, Link2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as postService from "@/features/posts/api/postService";
import { errorMessage } from "@/lib/errors";
import type { Post } from "@/features/posts/types";

/**
 * Share link for an unpublished draft.
 *
 * The token in the URL is the whole authorisation, so anyone holding the link
 * can read the draft — which is why rotating it is offered right next to it,
 * and why this only ever renders for the author of an unpublished post.
 */
export default function DraftShareLink({ post }: { post: Post }) {
  const [token, setToken] = useState(post.previewToken);
  const [copied, setCopied] = useState(false);

  const rotate = useMutation({
    mutationFn: () => postService.rotatePreviewToken(post.slug),
    onSuccess: (updated) => {
      setToken(updated.previewToken);
      setCopied(false);
      toast.success("New link created. The old one no longer works.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not create a new link.")),
  });

  if (post.status !== "draft" || !token) return null;

  const url = `${window.location.origin}/post/${post.slug}?preview=${token}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copying isn't available here — select the link and copy it manually.");
    }
  };

  return (
    <div className="surface-card mb-8 space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Share this draft</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Anyone with this link can read the draft without signing in. It stops working as soon as
        you create a new one.
      </p>

      <div className="flex flex-wrap gap-2">
        <Input readOnly value={url} onFocus={(event) => event.target.select()} className="flex-1 min-w-56 font-mono text-xs" />
        <Button type="button" variant="outline" onClick={copy} className="gap-2">
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => rotate.mutate()}
          disabled={rotate.isPending}
          className="gap-2"
          title="Create a new link and revoke the old one"
        >
          <RefreshCw className={rotate.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden="true" />
          New link
        </Button>
      </div>
    </div>
  );
}
