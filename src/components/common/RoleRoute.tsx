import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import SessionReconnecting from "@/components/common/SessionReconnecting";
import type { CurrentUser } from "@/features/users/types";

/** Capability flags the guard can require. */
type Capability = "canPublish" | "canEditOthers" | "canModerate" | "canManageUsers";

/**
 * Guards routes that need more than a signed-in account.
 *
 * Like ProtectedRoute this is a UX convenience: it keeps someone from landing
 * on a page whose every request would 403. The API is still the authority.
 * A signed-in user without the capability gets 404 rather than a redirect, so
 * the existence of the admin area is not advertised to ordinary readers.
 */
export default function RoleRoute({
  children,
  require: capability,
}: {
  children: ReactNode;
  require: Capability;
}) {
  const { user, isAuthenticated, isLoading, isOffline, retrySession } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">Checking your permissions…</span>
      </div>
    );
  }

  // A session we could not verify is not a session we know to be over.
  if (!isAuthenticated && isOffline) {
    return <SessionReconnecting onRetry={retrySession} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (!user?.[capability as keyof CurrentUser]) {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
}
