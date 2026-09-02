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

/** Called when a refresh fails, so the app can drop to a signed-out state. */
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
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = axios
      // A bare axios call, so this request cannot recurse through this interceptor.
      .post(`${BASE_URL || ""}/api/auth/refresh/`, {}, { withCredentials: true })
      .then((response) => {
        const token = response.data?.access ?? null;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
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
      const token = await refreshAccessToken();
      if (token) return axiosInstance(config);
      onSessionExpired?.();
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
