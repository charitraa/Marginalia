import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import { mediaUrl } from "@/lib/format";
import type { Paginated } from "@/types/common";

/**
 * Images uploaded from inside the post editor.
 *
 * The API stores the file against the uploading author and answers with the
 * absolute URL, which the editor inserts into the article body.
 */

export interface UploadedImage {
  id: string;
  url: string;
}

export async function uploadEditorImage(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.append("image", file);

  const { data } = await axiosInstance.post("/api/uploads/images/", form);
  return {
    id: String(data?.id ?? ""),
    url: mediaUrl(data?.url ?? "") ?? "",
  };
}

/** One image in the author's library. */
export interface LibraryImage {
  id: string;
  url: string;
  createdAt: string | null;
}

/**
 * Images this author has uploaded.
 *
 * Scoped to the uploader by the API, so one writer never browses another's
 * media even though the files sit in the same store.
 */
export async function listMyImages(page = 1): Promise<Paginated<LibraryImage>> {
  const { data } = await axiosInstance.get("/api/uploads/images/mine/", { params: { page } });
  return normalizePage(
    data,
    (raw: Record<string, any>) => ({
      id: String(raw.id ?? ""),
      url: mediaUrl(raw.url ?? "") ?? "",
      createdAt: raw.created_at ?? null,
    }),
    page,
    24,
  );
}
