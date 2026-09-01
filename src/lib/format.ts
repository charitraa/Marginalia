import { BASE_URL, WORDS_PER_MINUTE } from "@/constants";

/** Strips tags so HTML content can be measured and excerpted as plain text. */
export function toPlainText(html: string): string {
  return (html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html: string): number {
  const text = toPlainText(html);
  return text ? text.split(" ").length : 0;
}

/** Derived from the content when the API does not send reading_time. */
export function readingTimeFor(html: string): number {
  return Math.max(1, Math.round(wordCount(html) / WORDS_PER_MINUTE));
}

export function excerptFrom(html: string, limit = 180): string {
  const text = toPlainText(html);
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 60 ? lastSpace : limit).trimEnd()}…`;
}

export function slugify(value: string): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Media paths come back relative (/media/...) from some endpoints. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  const base = BASE_URL.replace(/\/$/, "");
  return `${base}/${String(path).replace(/^\//, "")}`;
}

export function initialsOf(name: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const DATE_FORMAT = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : DATE_FORMAT.format(date);
}

/** "3 days ago" for anything recent, an absolute date beyond a month. */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (let i = units.length - 1; i >= 0; i -= 1) {
    const [unit, unitSeconds] = units[i];
    if (seconds >= unitSeconds) {
      if (unit === "week" && seconds >= 2592000) break;
      return formatter.format(-Math.floor(seconds / unitSeconds), unit);
    }
  }
  return formatDate(value);
}

export function formatCount(value: number | null | undefined): string {
  if (value == null) return "";
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(value % 1000 >= 100 ? 1 : 0)}k`;
  return `${(value / 1_000_000).toFixed(1)}m`;
}
