import { count, text, type Raw } from "@/lib/api/normalize";
import { mediaUrl } from "@/lib/format";
import { normalizeAuthor } from "@/features/users/api/normalizers";
import type {
  Category,
  Post,
  PostRevision,
  PostRevisionDetail,
  PostStatus,
  ReadingHistoryEntry,
  Tag,
} from "../types";

export function normalizeCategory(raw: Raw | null | undefined): Category | null {
  if (!raw?.name) return null;
  return {
    id: String(raw.id ?? ""),
    name: raw.name,
    slug: text(raw.slug),
    description: text(raw.description),
    count: count(raw.post_count),
  };
}

export function normalizeTag(raw: Raw | null | undefined): Tag | null {
  if (!raw?.name) return null;
  return { id: String(raw.id ?? ""), name: raw.name, slug: text(raw.slug), count: count(raw.post_count) };
}

export function normalizePost(raw: Raw): Post {
  const status: PostStatus = raw.status === "draft" ? "draft" : "published";

  return {
    id: String(raw.id ?? ""),
    slug: text(raw.slug) || String(raw.id ?? ""),
    title: text(raw.title, "Untitled"),
    excerpt: text(raw.excerpt),
    // Only detail responses carry the body; list responses omit it by design.
    content: text(raw.content),
    coverImage: mediaUrl(raw.cover_image ?? null),
    author: normalizeAuthor(raw.author),
    category: normalizeCategory(raw.category),
    tags: Array.isArray(raw.tags)
      ? raw.tags.map(normalizeTag).filter((tag): tag is Tag => Boolean(tag))
      : [],
    status,
    publishedAt: raw.published_at ?? null,
    createdAt: raw.created_at ?? null,
    updatedAt: raw.updated_at ?? null,
    readingTime: typeof raw.reading_time === "number" ? raw.reading_time : 1,
    likeCount: count(raw.like_count),
    commentCount: count(raw.comment_count),
    viewCount: count(raw.view_count),
    isLiked: Boolean(raw.is_liked),
    isBookmarked: Boolean(raw.is_bookmarked),
    subtitle: text(raw.subtitle),
    visibility: (raw.visibility ?? "public") as Post["visibility"],
    scheduledFor: raw.scheduled_for ?? null,
    isFeatured: Boolean(raw.is_featured),
    isArchived: Boolean(raw.is_archived),
    seoTitle: text(raw.seo_title),
    seoDescription: text(raw.seo_description),
    canonicalUrl: text(raw.canonical_url),
    reviewNote: text(raw.review_note),
    reviewedAt: raw.reviewed_at ?? null,
    // Absent unless the API decided the requester owns this post.
    previewToken: raw.preview_token ? String(raw.preview_token) : null,
  };
}

export function normalizePostRevision(raw: Raw): PostRevision {
  return {
    id: String(raw.id ?? ""),
    title: text(raw.title, "Untitled"),
    note: text(raw.note),
    createdBy: raw.created_by ? normalizeAuthor(raw.created_by) : null,
    createdAt: raw.created_at ?? null,
    wordCount: typeof raw.word_count === "number" ? raw.word_count : 0,
  };
}

export function normalizePostRevisionDetail(raw: Raw): PostRevisionDetail {
  return {
    ...normalizePostRevision(raw),
    subtitle: text(raw.subtitle),
    excerpt: text(raw.excerpt),
    content: text(raw.content),
  };
}

export function normalizeReadingHistoryEntry(raw: Raw): ReadingHistoryEntry {
  return {
    id: String(raw.id ?? ""),
    post: normalizePost(raw.post ?? {}),
    progress: typeof raw.progress === "number" ? raw.progress : 0,
    isFinished: Boolean(raw.is_finished),
    lastReadAt: raw.last_read_at ?? null,
  };
}
