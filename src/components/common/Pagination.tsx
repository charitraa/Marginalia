import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  disabled?: boolean;
}

/** Compact numeric pager that collapses to arrows plus a count on small screens. */
function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) pages.push("gap");
  for (let current = start; current <= end; current += 1) pages.push(current);
  if (end < pageCount - 1) pages.push("gap");
  pages.push(pageCount);

  return pages;
}

export default function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
  disabled = false,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sr-only sm:hidden">Previous page</span>
      </Button>

      <ol className="hidden items-center gap-1 sm:flex">
        {pageWindow(page, pageCount).map((entry, index) =>
          entry === "gap" ? (
            <li key={`gap-${index}`} className="px-2 text-muted-foreground" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={entry}>
              <Button
                variant={entry === page ? "default" : "ghost"}
                size="sm"
                className="min-w-9"
                aria-current={entry === page ? "page" : undefined}
                aria-label={`Page ${entry}`}
                onClick={() => onPageChange(entry)}
                disabled={disabled}
              >
                {entry}
              </Button>
            </li>
          ),
        )}
      </ol>

      <span className="px-3 text-sm text-muted-foreground sm:hidden">
        {page} / {pageCount}
      </span>

      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= pageCount}
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sr-only sm:hidden">Next page</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
