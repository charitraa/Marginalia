import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import type { Paginated } from "@/types/common";

/**
 * Following a subject rather than a person.
 *
 * `kind` is "category" or "tag" — the two things a reader can subscribe to
 * besides an author.
 */
export type TopicKind = "category" | "tag";

export interface FollowedTopic {
  id: string;
  kind: TopicKind;
  slug: string;
  name: string;
  createdAt: string | null;
}

export interface TopicFollowState {
  isFollowing: boolean;
  followerCount: number;
}

function normalizeTopic(raw: Record<string, any>): FollowedTopic {
  return {
    id: String(raw.id ?? ""),
    kind: raw.kind === "tag" ? "tag" : "category",
    slug: String(raw.slug ?? ""),
    name: String(raw.name ?? ""),
    createdAt: raw.created_at ?? null,
  };
}

export async function setTopicFollow(
  kind: TopicKind,
  slug: string,
  following: boolean,
): Promise<TopicFollowState> {
  const path = `/api/topics/${kind}/${slug}/follow/`;
  const { data } = following
    ? await axiosInstance.post(path)
    : await axiosInstance.delete(path);
  return {
    isFollowing: Boolean(data?.is_following),
    followerCount: typeof data?.follower_count === "number" ? data.follower_count : 0,
  };
}

export async function listFollowedTopics(): Promise<Paginated<FollowedTopic>> {
  const { data } = await axiosInstance.get("/api/topics/following/");
  return normalizePage(data, normalizeTopic, 1, 50);
}
