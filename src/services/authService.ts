import { axiosInstance, setAccessToken } from "./ApiClients";
import { normalizeCurrentUser } from "./normalizers";
import { PENDING_VERIFICATION_KEY, SESSION_FLAG_KEY } from "@/constants";
import type { CurrentUser } from "@/types/blog";

/**
 * Authentication.
 *
 * The access token is returned in the body and kept in memory for this tab only;
 * the refresh token is set as an httpOnly cookie the browser replays on its own.
 * Nothing readable by JavaScript is persisted, so an XSS has no session to steal.
 * SESSION_FLAG_KEY records only that the user intends to be signed in, which
 * keeps a signed-out visitor from firing a pointless request on every load.
 */

export interface RegisterInput {
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type AuthOutcome =
  | { status: "authenticated"; user: CurrentUser | null }
  | { status: "verification-required"; email: string; message: string };

function rememberSession() {
  try {
    localStorage.setItem(SESSION_FLAG_KEY, "1");
  } catch {
    /* storage disabled; the refresh cookie still carries the session */
  }
}

export function forgetSession() {
  try {
    localStorage.removeItem(SESSION_FLAG_KEY);
    localStorage.removeItem(PENDING_VERIFICATION_KEY);
  } catch {
    /* nothing to clear */
  }
  setAccessToken(null);
}

export function hasSessionFlag(): boolean {
  try {
    return localStorage.getItem(SESSION_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPendingVerification(email: string | null) {
  try {
    if (email) localStorage.setItem(PENDING_VERIFICATION_KEY, email);
    else localStorage.removeItem(PENDING_VERIFICATION_KEY);
  } catch {
    /* optional convenience only */
  }
}

export function getPendingVerification(): string {
  try {
    return localStorage.getItem(PENDING_VERIFICATION_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Reads the shared `{message, user, access, refresh}` / verification envelope. */
function readAuthPayload(data: any, email: string): AuthOutcome {
  if (data?.requires_verification) {
    setPendingVerification(data.email ?? email);
    return {
      status: "verification-required",
      email: data.email ?? email,
      message: data.message ?? "We sent a verification code to your email.",
    };
  }

  if (data?.access) setAccessToken(data.access);
  rememberSession();
  setPendingVerification(null);
  return {
    status: "authenticated",
    user: data?.user ? normalizeCurrentUser(data.user) : null,
  };
}

export async function register(input: RegisterInput): Promise<AuthOutcome> {
  const body: Record<string, unknown> = {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    password: input.password,
    confirm_password: input.confirmPassword,
  };
  if (input.username?.trim()) body.username = input.username.trim();

  const { data } = await axiosInstance.post("/api/auth/register/", body);
  return readAuthPayload(data, input.email);
}

/** `email` accepts an email address or a username. */
export async function login(input: LoginInput): Promise<AuthOutcome> {
  const { data } = await axiosInstance.post("/api/auth/login/", {
    email: input.email,
    password: input.password,
  });
  return readAuthPayload(data, input.email);
}

export async function verifyEmail(email: string, code: string): Promise<CurrentUser | null> {
  const { data } = await axiosInstance.post("/api/auth/verify/", { email, code });
  const outcome = readAuthPayload(data, email);
  return outcome.status === "authenticated" ? outcome.user : null;
}

export async function resendCode(email: string): Promise<void> {
  await axiosInstance.post("/api/auth/resend-code/", { email });
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await axiosInstance.get("/api/users/me/");
  return normalizeCurrentUser(data);
}

/**
 * Restores a session on boot using the httpOnly refresh cookie. Returns the new
 * access token, or null when there is no valid session to restore.
 */
export async function restoreSession(): Promise<string | null> {
  try {
    const { data } = await axiosInstance.post("/api/auth/refresh/", {});
    const token = data?.access ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

/**
 * Ends the session. The server blacklists the refresh token and clears both
 * cookies — JavaScript cannot delete an httpOnly cookie, so this call is what
 * makes a logout real rather than cosmetic.
 */
export async function logout(): Promise<{ serverCleared: boolean }> {
  try {
    await axiosInstance.post("/api/auth/logout/", {});
    return { serverCleared: true };
  } catch {
    return { serverCleared: false };
  } finally {
    forgetSession();
  }
}
