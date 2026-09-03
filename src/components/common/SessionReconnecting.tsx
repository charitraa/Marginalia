import { RotateCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown on a guarded page when the app believes there is a session but cannot
 * reach the API to prove it — the device is offline, or the server has not
 * answered yet.
 *
 * The point is that this is *not* the login page. Bouncing a signed-in reader
 * to /login over a dropped connection loses their place and reads as having
 * been signed out, when nothing about their session has actually changed.
 */
export default function SessionReconnecting({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[60vh] max-w-measure flex-col items-start justify-center px-4"
    >
      <WifiOff className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-5 font-serif text-2xl font-semibold">You're offline</h2>
      <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
        We can't reach the server right now, so this page is on hold. You're still
        signed in — it will pick up on its own as soon as the connection is back.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-6 gap-2" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try now
        </Button>
      )}
    </div>
  );
}
