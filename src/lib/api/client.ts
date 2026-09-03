import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { BASE_URL } from "@/config/constants";

/**
 * Shared axios instance.
 *
 * Transport, matching the API: the short-lived access token is held in memory
 * only and sent as `Authorization: Bearer`. The refresh token lives in an
 * httpOnly cookie the browser attaches automatically, so nothing sensitive is
 * ever readable by JavaScript and an XSS cannot steal a session. `withCredentials`
 * is what lets those cookies travel cross-origin.
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL || "/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 20000,
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

axiosInstance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  // Let the browser set the multipart boundary itself.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  return config;
});

/**
 * True when a request never got an answer it can trust: the browser is offline,
 * DNS or CORS failed, the request timed out, or the server is briefly down or
 * still waking from a cold start.
 *
 * This is the difference between "we do not know who you are" and "we could not
 * ask". Only the first is a reason to sign somebody out; treating the second as
 * a signed-out state is what strands a reader on the login page after a blip in
 * their connection, with a perfectly good refresh cookie still in the browser.
 */
export function isTransportFailure(error: unknown): boolean {
  const status = (error as AxiosError)?.response?.status;
  // No response at all: offline, timeout, DNS, CORS, aborted.
  if (status === undefined) return true;
  // The server answered, but not with an opinion about this session.
  return status >= 500 || status === 408 || status === 429;
}

export type RefreshOutcome =
  /** A new access token was issued. */
  | { status: "refreshed"; token: string }
  /** The server refused the refresh token: this session is genuinely over. */
  | { status: "signed-out" }
  /** We could not reach the server. The session may well still be valid. */
  | { status: "unreachable" };

/** Called when the server refuses a refresh, so the app can drop to signed out. */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Endpoints that must never trigger a refresh attempt: a 401 from them *is* the
// answer, and retrying would loop.
const NO_REFRESH = ["/api/auth/login/", "/api/auth/refresh/", "/api/auth/register/", "/api/auth/verify/"];

/**
 * A single in-flight refresh shared by every request that gets a 401, so a page
 * with six parallel queries refreshes once instead of six times.
 */
let refreshInFlight: Promise<RefreshOutcome> | null = null;

export async function refreshAccessToken(): Promise<RefreshOutcome> {
  if (!refreshInFlight) {
    refreshInFlight = axios
      // A bare axios call, so this request cannot recurse through this interceptor.
      .post(`${BASE_URL || ""}/api/auth/refresh/`, {}, { withCredentials: true })
      .then((response): RefreshOutcome => {
        const token = response.data?.access ?? null;
        if (!token) {
          setAccessToken(null);
          return { status: "signed-out" };
        }
        setAccessToken(token);
        return { status: "refreshed", token };
      })
      .catch((error): RefreshOutcome => {
        // The in-memory token is known-stale either way; the session flag is
        // what must survive, and only the caller decides that.
        setAccessToken(null);
        return isTransportFailure(error) ? { status: "unreachable" } : { status: "signed-out" };
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const refreshable =
      status === 401 &&
      config &&
      !config._retried &&
      !NO_REFRESH.some((path) => (config.url ?? "").includes(path));

    if (refreshable) {
      config._retried = true;
      const outcome = await refreshAccessToken();
      if (outcome.status === "refreshed") return axiosInstance(config);
      // A refresh we could not deliver says nothing about the session, so the
      // request fails and the caller retries later. Only a refusal signs out.
      if (outcome.status === "signed-out") onSessionExpired?.();
    }

    return Promise.reject(error);
  },
);

/**
 * Thin typed wrapper around the shared instance, kept from the project's
 * original services layer so existing call sites stay valid.
 */
class APIClient<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  private url(params?: string | number) {
    return params !== undefined && params !== null && params !== ""
      ? `${this.endpoint}/${params}`
      : this.endpoint;
  }

  getAll = async (params?: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.get<T[]>(this.url(params), config);
    return response.data;
  };

  get = async (params?: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.get<T>(this.url(params), config);
    return response.data;
  };

  post = async (data: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.post<T>(this.endpoint, data, config);
    return response.data;
  };

  put = async (data: any, params?: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.put<T>(this.url(params), data, config);
    return response.data;
  };

  patch = async (data: any, params?: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.patch<T>(this.url(params), data, config);
    return response.data;
  };

  delete = async (params?: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.delete<T>(this.url(params), config);
    return response.data;
  };
}

export { axiosInstance };
export default APIClient;
