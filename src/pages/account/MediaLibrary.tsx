import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import * as uploadService from "@/features/uploads/api/uploadService";
import { pageCount } from "@/lib/api/normalize";
import { formatRelative } from "@/lib/format";

/**
 * Every image this author has uploaded from the editor.
 *
 * Exists because uploads were previously write-only: a picture used in one
 * article could not be found again to reuse in another, so writers re-uploaded
 * the same file. Copying the URL is the primary action, which is why it is the
 * one on the tile rather than behind a menu.
 */
export default function MediaLibrary() {
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["media", "mine", page],
    queryFn: () => uploadService.listMyImages(page),
    placeholderData: (previous) => previous,
  });

  const images = data?.items ?? [];

  const copy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Copying isn't available here — open the image and copy its address.");
    }
  };

  return (
    <Layout>
      <Seo title="Media library" noIndex />

      <div className="container-page py-10">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Media library</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Images you&apos;ve uploaded from the editor. Copy a URL to reuse one in
            another post instead of uploading it again.
          </p>
        </header>

        {isError ? (
          <ErrorState error={error} title="We couldn't load your images."
                      onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <EmptyState
            icon={<ImageIcon className="h-10 w-10" />}
            title="No images yet"
            description="Images you add to a post from the editor toolbar collect here."
            action={{ label: "Write something", to: "/write" }}
          />
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <li key={image.id} className="group overflow-hidden rounded-lg border border-border">
                  <div className="aspect-square bg-muted">
                    <img
                      src={image.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {formatRelative(image.createdAt)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 shrink-0 gap-1.5 px-2 text-xs"
                      onClick={() => copy(image.url, image.id)}
                      aria-label="Copy image URL"
                    >
                      {copied === image.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {data && pageCount(data) > 1 && (
              <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
            )}
          </>
        )}

        <p className="mt-8 flex items-start gap-2 text-xs text-muted-foreground">
          <Upload className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Upload new images from the image button in the post editor&apos;s toolbar.
        </p>
      </div>
    </Layout>
  );
}
