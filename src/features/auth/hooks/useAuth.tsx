import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as authService from "@/features/auth/api/authService";
import { isTransportFailure, setSessionExpiredHandler } from "@/lib/api/client";
import type { CurrentUser } from "@/features/users/types";

/**
 * Authentication state for the whole app.
 *
 * On boot the access token is gone (it only ever lived in memory), so we trade
 * the httpOnly refresh cookie for a fresh one and then ask the API who we are.
 * The local flag records intent only, which keeps a signed-out visitor from
 * firing a refresh request on every page load.
 *
 * The flag is deleted only when the server actually refuses the session. A load
 * that happens while the device is offline — or while the API is still waking
 * from a cold start — leaves it in place and retries, because the refresh cookie
 * is almost certainly still good and throwing the flag away would lock the
 * reader out of a session the browser can still prove.
 */

/** Where the session restore has got to. */
export type SessionStatus =
  /** Still trading the refresh cookie for a token. */
  | "restoring"
  /** We know who the user is. */
  | "authenticated"
  /** No session, or the server refused the one we had. */
  | "signed-out"
  /** We believe there is a session but cannot reach the server to prove it. */
  | "unreachable";

/** Backoff between reconnection attempts while the API is unreachable. */
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 20_000, 30_000];

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  /** True until the initial session restore settles. */
  isLoading: boolean;
  sessionStatus: SessionStatus;
  /** True when a session is believed to exist but the API is unreachable. */
  isOffline: boolean;
  login: (email: string, password: string) => Promise<authService.AuthOutcome>;
  register: (input: authService.RegisterInput) => Promise<authService.AuthOutcome>;
  verifyEmail: (email: string, code: string) => Promise<CurrentUser | null>;
  logout: () => Promise<{ serverCleared: boolean }>;
  refresh: () => Promise<void>;
  /** Re-attempt a restore that failed because the API was unreachable. */
  retrySession: () => void;
  setUser: (user: CurrentUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(() =>
    authService.hasSessionFlag() ? "restoring" : "signed-out",
  );

  // Guards every async state write against an unmounted provider, and lets a
  // manual retry cancel the pending backoff timer.
  const mounted = useRef(true);
  const attemptRef = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /**
   * One restore attempt: refresh cookie -> access token -> who am I.
   *
   * Any step that fails for transport reasons parks the app in "unreachable"
   * with the session flag intact; only a refusal from the server clears it.
   */
  const attemptRestore = useCallback(async () => {
    if (!authService.hasSessionFlag()) {
      if (!mounted.current) return;
      setUser(null);
      setSessionStatus("signed-out");
      return;
    }

    const outcome = await authService.restoreSession();
    if (!mounted.current) return;

    if (outcome === "unreachable") {
      setSessionStatus("unreachable");
      return;
    }

    if (outcome === "signed-out") {
      setUser(null);
      authService.forgetSession();
      setSessionStatus("signed-out");
      return;
    }

    try {
      const current = await authService.getCurrentUser();
      if (!mounted.current) return;
      setUser(current);
      setSessionStatus("authenticated");
    } catch (error) {
      if (!mounted.current) return;
      // A token was just issued, so an unreachable /me is a network problem,
      // not a rejected session.
      if (isTransportFailure(error)) {
        setSessionStatus("unreachable");
        return;
      }
      setUser(null);
      authService.forgetSession();
      setSessionStatus("signed-out");
    }
  }, []);

  const retrySession = useCallback(() => {
    attemptRef.current = 0;
    setSessionStatus((current) => (current === "unreachable" ? "restoring" : current));
  }, []);

  /** Public refresh of the current user. Offline leaves the session alone. */
  const refresh = useCallback(async () => {
    try {
      const current = await authService.getCurrentUser();
      if (!mounted.current) return;
      setUser(current);
      setSessionStatus("authenticated");
    } catch (error) {
      if (!mounted.current) return;
      if (isTransportFailure(error)) {
        setSessionStatus(authService.hasSessionFlag() ? "unreachable" : "signed-out");
        return;
      }
      setUser(null);
      authService.forgetSession();
      setSessionStatus("signed-out");
    }
  }, []);

  // A refresh the server *refuses* mid-session drops the app to signed out
  // rather than leaving stale user data on screen. A refresh that never
  // arrived does not reach this handler.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      authService.forgetSession();
      setSessionStatus("signed-out");
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  // Boot, and every subsequent retry, run through the same attempt.
  useEffect(() => {
    if (sessionStatus !== "restoring") return;
    void attemptRestore();
  }, [sessionStatus, attemptRestore]);

  // While unreachable, keep trying: immediately when the device says it is back
  // online or the tab is looked at again, and on a widening backoff otherwise.
  useEffect(() => {
    if (sessionStatus !== "unreachable") {
      // A settled session starts the next outage from the shortest delay again.
      // "restoring" must not reset it, or the backoff would never widen.
      if (sessionStatus !== "restoring") attemptRef.current = 0;
      return;
    }

    const again = () => {
      attemptRef.current += 1;
      setSessionStatus("restoring");
    };

    const delay = RETRY_DELAYS_MS[Math.min(attemptRef.current, RETRY_DELAYS_MS.length - 1)];
    const timer = window.setTimeout(again, delay);

    const onOnline = () => {
      window.clearTimeout(timer);
      again();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine !== false) onOnline();
    };

    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sessionStatus]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login({ email, password });
      if (result.status === "authenticated") {
        if (result.user) {
          setUser(result.user);
          setSessionStatus("authenticated");
        } else {
          await refresh();
        }
      }
      return result;
    },
    [refresh],
  );

  const register = useCallback(
    async (input: authService.RegisterInput) => {
      const result = await authService.register(input);
      if (result.status === "authenticated") {
        if (result.user) {
          setUser(result.user);
          setSessionStatus("authenticated");
        } else {
          await refresh();
        }
      }
      return result;
    },
    [refresh],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const verified = await authService.verifyEmail(email, code);
      if (verified) {
        setUser(verified);
        setSessionStatus("authenticated");
      } else {
        await refresh();
      }
      return verified;
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    const result = await authService.logout();
    setUser(null);
    setSessionStatus("signed-out");
    return result;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: sessionStatus === "restoring",
      sessionStatus,
      isOffline: sessionStatus === "unreachable",
      login,
      register,
      verifyEmail,
      logout,
      refresh,
      retrySession,
      setUser,
    }),
    [user, sessionStatus, login, register, verifyEmail, logout, refresh, retrySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}

/** True when the signed-in user owns the given author record. */
export function useIsOwner(authorId: string | undefined, username?: string): boolean {
  const { user } = useAuth();
  if (!user || !authorId) return false;
  return user.id === authorId || (Boolean(username) && user.username === username);
}
