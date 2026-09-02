import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as authService from "@/features/auth/api/authService";
import { setSessionExpiredHandler } from "@/lib/api/client";
import type { CurrentUser } from "@/features/users/types";

/**
 * Authentication state for the whole app.
 *
 * On boot the access token is gone (it only ever lived in memory), so we trade
 * the httpOnly refresh cookie for a fresh one and then ask the API who we are.
 * The local flag records intent only, which keeps a signed-out visitor from
 * firing a refresh request on every page load.
 */

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  /** True until the initial session restore settles. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<authService.AuthOutcome>;
  register: (input: authService.RegisterInput) => Promise<authService.AuthOutcome>;
  verifyEmail: (email: string, code: string) => Promise<CurrentUser | null>;
  logout: () => Promise<{ serverCleared: boolean }>;
  refresh: () => Promise<void>;
  setUser: (user: CurrentUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => authService.hasSessionFlag());

  const refresh = useCallback(async () => {
    try {
      setUser(await authService.getCurrentUser());
    } catch {
      setUser(null);
      authService.forgetSession();
    }
  }, []);

  // A refresh that fails mid-session drops the app to signed out rather than
  // leaving stale user data on screen.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      authService.forgetSession();
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    let active = true;

    if (!authService.hasSessionFlag()) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const token = await authService.restoreSession();
        if (!token) throw new Error("no session");
        const current = await authService.getCurrentUser();
        if (active) setUser(current);
      } catch {
        if (active) {
          setUser(null);
          authService.forgetSession();
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login({ email, password });
      if (result.status === "authenticated") {
        if (result.user) setUser(result.user);
        else await refresh();
      }
      return result;
    },
    [refresh],
  );

  const register = useCallback(
    async (input: authService.RegisterInput) => {
      const result = await authService.register(input);
      if (result.status === "authenticated") {
        if (result.user) setUser(result.user);
        else await refresh();
      }
      return result;
    },
    [refresh],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const verified = await authService.verifyEmail(email, code);
      if (verified) setUser(verified);
      else await refresh();
      return verified;
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    const result = await authService.logout();
    setUser(null);
    return result;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      verifyEmail,
      logout,
      refresh,
      setUser,
    }),
    [user, isLoading, login, register, verifyEmail, logout, refresh],
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
