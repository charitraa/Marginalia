import { axiosInstance } from "@/lib/api/client";
import { mediaUrl } from "@/lib/format";

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
