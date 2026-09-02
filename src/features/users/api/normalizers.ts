import { count, text, type Raw } from "@/lib/api/normalize";
import { mediaUrl } from "@/lib/format";
import type { Author, CurrentUser } from "../types";

/**
 * `Author` is embedded in posts, comments and notifications, so this is the one
 * normalizer other features depend on. It never returns null — an absent author
 * becomes a placeholder rather than forcing every caller to null-check.
 */
export function normalizeAuthor(raw: Raw | null | undefined): Author {
  if (!raw) {
    return {
      id: "",
      username: "",
      name: "Unknown author",
      avatar: null,
      headline: "",
      bio: "",
      joinedAt: null,
      postCount: null,
      followerCount: null,
      followingCount: null,
      totalLikes: null,
      isFollowing: false,
      website: "",
      twitter: "",
      github: "",
      linkedin: "",
    };
  }

  return {
    id: String(raw.id ?? ""),
    username: text(raw.username),
    name: text(raw.name) || text(raw.username) || "Unknown author",
    avatar: mediaUrl(raw.avatar ?? null),
    headline: text(raw.headline),
    bio: text(raw.bio),
    joinedAt: raw.date_joined ?? null,
    postCount: count(raw.post_count),
    followerCount: count(raw.follower_count),
    followingCount: count(raw.following_count),
    totalLikes: count(raw.total_likes),
    isFollowing: Boolean(raw.is_following),
    website: text(raw.website),
    twitter: text(raw.twitter),
    github: text(raw.github),
    linkedin: text(raw.linkedin),
  };
}

export function normalizeCurrentUser(raw: Raw): CurrentUser {
  return {
    ...normalizeAuthor(raw),
    email: text(raw.email),
    firstName: text(raw.first_name),
    lastName: text(raw.last_name),
    city: text(raw.city),
    district: text(raw.district),
    isVerified: Boolean(raw.is_verified),
    isStaff: Boolean(raw.is_staff),
  };
}
