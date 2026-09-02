import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import { normalizeAuthor, normalizeCurrentUser } from "./normalizers";
import type { Author, CurrentUser, DashboardStats } from "@/features/users/types";
import type { Paginated } from "@/types/common";

export interface ProfileInput {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  headline?: string;
  city?: string;
  district?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
}

/**
 * Profile edit.
 *
 * Email is deliberately absent: changing it needs re-verification and has its
 * own endpoint. The API ignores permission fields regardless of what is sent.
 */
export async function updateProfile(input: ProfileInput): Promise<CurrentUser> {
  const { data } = await axiosInstance.patch("/api/users/me/", {
    first_name: input.firstName,
    last_name: input.lastName,
    username: input.username,
    bio: input.bio,
    headline: input.headline ?? "",
    city: input.city ?? "",
    district: input.district ?? "",
    website: input.website ?? "",
    twitter: input.twitter ?? "",
    github: input.github ?? "",
    linkedin: input.linkedin ?? "",
  });
  return normalizeCurrentUser(data);
}

export async function updateAvatar(file: File): Promise<CurrentUser> {
  const form = new FormData();
  form.append("photo", file);
  const { data } = await axiosInstance.post("/api/users/me/avatar/", form);
  return normalizeCurrentUser(data);
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  await axiosInstance.post("/api/users/me/password/", {
    current_password: input.currentPassword,
    new_password: input.newPassword,
    new_password_confirm: input.confirmPassword,
  });
}

/** Changing an email returns the account to an unverified state. */
export async function changeEmail(email: string): Promise<{ email: string; message: string }> {
  const { data } = await axiosInstance.post("/api/users/me/email/", { email });
  return { email: data?.email ?? email, message: data?.message ?? "Verification code sent." };
}

/** Public author profile. Guests can view it. */
export async function getAuthor(username: string): Promise<Author> {
  const { data } = await axiosInstance.get(`/api/users/${username}/`);
  return normalizeAuthor(data);
}

export async function listAuthors(page = 1): Promise<Paginated<Author>> {
  const { data } = await axiosInstance.get("/api/users/", { params: { page, page_size: 12 } });
  return normalizePage(data, normalizeAuthor, page, 12);
}

export async function setFollow(
  username: string,
  following: boolean,
): Promise<{ isFollowing: boolean; followerCount: number | null }> {
  const path = `/api/users/${username}/follow/`;
  const { data } = following
    ? await axiosInstance.post(path)
    : await axiosInstance.delete(path);
  return {
    isFollowing: Boolean(data?.is_following),
    followerCount: typeof data?.follower_count === "number" ? data.follower_count : null,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await axiosInstance.get("/api/users/me/dashboard/");
  const read = (key: string): number | null =>
    typeof data?.[key] === "number" ? data[key] : null;

  return {
    totalPosts: read("total_posts"),
    publishedPosts: read("published_posts"),
    draftPosts: read("draft_posts"),
    totalLikes: read("total_likes"),
    totalComments: read("total_comments"),
    totalViews: read("total_views"),
    followerCount: read("follower_count"),
  };
}
