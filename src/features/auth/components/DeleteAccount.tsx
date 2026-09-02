import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import * as authService from "@/features/auth/api/authService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { errorMessage } from "@/lib/errors";

/**
 * Deleting your account.
 *
 * The consequences are stated as numbers before the confirmation, because
 * "are you sure?" is a far weaker question than "this deletes 47 posts and
 * 210 comments". Two hurdles then follow — the password, and the username
 * typed out — so this cannot happen by a misfire on a red button.
 */
export default function DeleteAccount() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { data: summary } = useQuery({
    queryKey: ["account", "deletion-summary"],
    queryFn: authService.getAccountSummary,
    // Fetched only when the dialog opens: it is a count query nobody needs on
    // a settings page they are only visiting to change their bio.
    enabled: open,
  });

  // A provider-only account was never given a password to confirm with.
  const needsPassword = user?.authProvider === "email" || !user?.authProvider;

  const remove = useMutation({
    mutationFn: () =>
      authService.deleteAccount(confirmName.trim(), needsPassword ? password : undefined),
    onSuccess: () => {
      setUser(null);
      toast.success("Your account has been deleted.");
      navigate("/", { replace: true });
    },
    onError: (err) => setError(errorMessage(err, "Could not delete your account.")),
  });

  const nameMatches =
    confirmName.trim().toLowerCase() === (user?.username ?? "").toLowerCase();
  const ready = nameMatches && (!needsPassword || password.length > 0);

  return (
    <section className="rounded-lg border border-destructive/30 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        Delete account
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Permanently deletes your account along with everything you have written.
        This cannot be undone.
      </p>
      <Button
        variant="outline"
        className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          setOpen(true);
          setError("");
        }}
      >
        Delete my account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This is permanent. There is no recovery and no grace period.
            </DialogDescription>
          </DialogHeader>

          {summary && !summary.canDelete ? (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {summary.blocker}
            </p>
          ) : (
            <div className="space-y-4">
              {summary && (
                <div className="rounded-md border border-border p-3 text-sm">
                  <p className="font-medium">This will delete:</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                      {summary.posts} {summary.posts === 1 ? "post" : "posts"}
                      {summary.publishedPosts > 0 && ` (${summary.publishedPosts} published)`}
                    </li>
                    <li>{summary.comments} {summary.comments === 1 ? "comment" : "comments"}</li>
                    <li>
                      your profile, and {summary.followers}{" "}
                      {summary.followers === 1 ? "follower" : "followers"} lose it
                    </li>
                  </ul>
                </div>
              )}

              {error && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirm-username">
                  Type <span className="font-mono">{user?.username}</span> to confirm
                </Label>
                <Input
                  id="confirm-username"
                  value={confirmName}
                  autoComplete="off"
                  onChange={(event) => setConfirmName(event.target.value)}
                />
              </div>

              {needsPassword && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Your password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Keep my account</Button>
            <Button
              variant="destructive"
              className="gap-2"
              disabled={!ready || remove.isPending || (summary && !summary.canDelete)}
              onClick={() => {
                setError("");
                remove.mutate();
              }}
            >
              {remove.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
