import { AxiosError } from "axios";

/**
 * Turns any failure into a sentence a reader should see. Raw serializer output
 * and stack traces never reach the UI; the console keeps the detail for devs.
 */
const FALLBACK = "Something went wrong. Please try again.";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check the highlighted fields and try again.",
  401: "Please sign in to continue.",
  403: "You do not have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That conflicts with something that already exists.",
  413: "That file is too large. Please choose a smaller one.",
  429: "Too many attempts. Please wait a moment and try again.",
};

function firstString(value: unknown, depth = 0): string | null {
  if (depth > 4) return null;
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = firstString(entry, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["message", "detail", "error", "non_field_errors"]) {
      const found = firstString(record[key], depth + 1);
      if (found) return found;
    }
    for (const entry of Object.values(record)) {
      const found = firstString(entry, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

/** Field level errors, keyed by form field, for inline display. */
export function fieldErrors(error: unknown): Record<string, string> {
  const data = (error as AxiosError)?.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (["status_code", "detail", "message", "non_field_errors"].includes(key)) continue;
    const text = firstString(value);
    if (text) result[key] = text;
  }
  return result;
}

export function errorMessage(error: unknown, fallback = FALLBACK): string {
  const axiosError = error as AxiosError;

  if (axiosError?.code === "ERR_NETWORK" || axiosError?.code === "ECONNABORTED") {
    return "We can't reach the server right now. Please check your connection.";
  }

  const status = axiosError?.response?.status;
  const fromBody = firstString(axiosError?.response?.data);

  // Django wraps some messages in braces, e.g. "{ Login required }".
  const cleaned = fromBody?.replace(/^\{\s*|\s*\}$/g, "").trim();

  if (cleaned && cleaned.length < 160 && !cleaned.startsWith("<")) return cleaned;
  if (status && STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status && status >= 500) return "The server had a problem. Please try again shortly.";
  return fallback;
}
