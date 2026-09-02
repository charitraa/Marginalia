import { text, type Raw } from "@/lib/api/normalize";
import { mediaUrl } from "@/lib/format";
import { normalizeAuthor } from "@/features/users/api/normalizers";
import { normalizePost } from "@/features/posts/api/normalizers";
import type { Series, SeriesDetail, SeriesEntry } from "../types";

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

export function normalizeSeries(raw: Raw): Series {
  return {
    id: String(raw.id ?? ""),
    title: text(raw.title, "Untitled series"),
    slug: text(raw.slug),
    description: text(raw.description),
    coverImage: mediaUrl(raw.cover_image ?? null),
    author: normalizeAuthor(raw.author),
    isPublished: Boolean(raw.is_published),
    postCount: num(raw.post_count),
    completedCount: num(raw.completed_count),
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
  };
}

export function normalizeSeriesEntry(raw: Raw): SeriesEntry {
  return {
    id: String(raw.id ?? ""),
    position: num(raw.position),
    post: normalizePost(raw.post ?? {}),
  };
}

export function normalizeSeriesDetail(raw: Raw): SeriesDetail {
  return {
    ...normalizeSeries(raw),
    entries: Array.isArray(raw.entries) ? raw.entries.map(normalizeSeriesEntry) : [],
    completedPostIds: Array.isArray(raw.completed_post_ids)
      ? raw.completed_post_ids.map(String)
      : [],
    nextPostSlug: raw.next_post_slug ?? null,
  };
}
