import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import SessionReconnecting from "@/components/common/SessionReconnecting";
import { Loader2 } from "lucide-react";

/**
 * Guards routes that need a signed-in user. This is a UX convenience only —
 * the API remains the authority on what a request is allowed to do.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isOffline, retrySession } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  // A session we could not verify is not a session we know to be over.
  if (!isAuthenticated && isOffline) {
    return <SessionReconnecting onRetry={retrySession} />;
  }

  if (!isAuthenticated) {
    // Remember where they were headed so login can return them there.
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <>{children}</>;
}
