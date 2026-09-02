import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import { normalizeSeries, normalizeSeriesDetail } from "./normalizers";
import type { Paginated } from "@/types/common";
import type { Series, SeriesDetail, SeriesInput } from "../types";

export async function listSeries(
  query: { search?: string; page?: number } = {},
): Promise<Paginated<Series>> {
  const params: Record<string, string | number> = { page: query.page ?? 1 };
  if (query.search?.trim()) params.search = query.search.trim();

  const { data } = await axiosInstance.get("/api/series/", { params });
  return normalizePage(data, normalizeSeries, query.page ?? 1, 10);
}

export async function getSeries(slug: string): Promise<SeriesDetail> {
  const { data } = await axiosInstance.get(`/api/series/${slug}/`);
  return normalizeSeriesDetail(data);
}

/** A cover image forces multipart; without one a plain JSON body is enough. */
function toPayload(input: SeriesInput) {
  const base = {
    title: input.title,
    description: input.description,
    is_published: input.isPublished,
  };
  if (input.coverImage instanceof File) {
    const form = new FormData();
    Object.entries(base).forEach(([key, value]) => form.append(key, String(value)));
    form.append("cover_image", input.coverImage);
    return form;
  }
  return base;
}

export async function createSeries(input: SeriesInput): Promise<Series> {
  const { data } = await axiosInstance.post("/api/series/", toPayload(input));
  return normalizeSeries(data);
}

export async function updateSeries(slug: string, input: SeriesInput): Promise<Series> {
  const { data } = await axiosInstance.patch(`/api/series/${slug}/`, toPayload(input));
  return normalizeSeries(data);
}

export async function deleteSeries(slug: string): Promise<void> {
  await axiosInstance.delete(`/api/series/${slug}/`);
}

export async function addPost(slug: string, postSlug: string): Promise<SeriesDetail> {
  const { data } = await axiosInstance.post(`/api/series/${slug}/posts/`, { post: postSlug });
  return normalizeSeriesDetail(data);
}

export async function removePost(slug: string, postSlug: string): Promise<SeriesDetail> {
  const { data } = await axiosInstance.delete(`/api/series/${slug}/posts/`, {
    params: { post: postSlug },
  });
  return normalizeSeriesDetail(data);
}

/** Sends the whole running order, so a drag-and-drop is one request. */
export async function reorder(slug: string, postSlugs: string[]): Promise<SeriesDetail> {
  const { data } = await axiosInstance.post(`/api/series/${slug}/reorder/`, { slugs: postSlugs });
  return normalizeSeriesDetail(data);
}

export async function markPartRead(slug: string, postSlug: string): Promise<number> {
  const { data } = await axiosInstance.post(`/api/series/${slug}/progress/`, { post: postSlug });
  return typeof data?.completed === "number" ? data.completed : 0;
}

export async function unmarkPartRead(slug: string, postSlug: string): Promise<number> {
  const { data } = await axiosInstance.delete(`/api/series/${slug}/progress/`, {
    params: { post: postSlug },
  });
  return typeof data?.completed === "number" ? data.completed : 0;
}
