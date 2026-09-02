import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Series } from "../types";

/**
 * A series in a list.
 *
 * The progress bar only appears once the reader has actually started, so a
 * fresh series is not decorated with an empty meter.
 */
export default function SeriesCard({ series }: { series: Series }) {
  const percent = series.postCount
    ? Math.round((series.completedCount / series.postCount) * 100)
    : 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-border transition-colors hover:border-foreground/25">
      <Link to={`/series/${series.slug}`} className="block">
        {series.coverImage ? (
          <img
            src={series.coverImage}
            alt=""
            loading="lazy"
            className="h-36 w-full object-cover"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center bg-muted">
            <Layers className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold leading-snug group-hover:underline">
            {series.title}
          </h3>
          {series.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {series.description}
            </p>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            {series.postCount} {series.postCount === 1 ? "part" : "parts"}
            {" · "}
            {series.author.name}
            {!series.isPublished && " · Unpublished"}
          </p>

          {series.completedCount > 0 && (
            <div className="mt-3">
              <Progress value={percent} className="h-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">
                {series.completedCount} of {series.postCount} finished
              </p>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
