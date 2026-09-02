import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  name: string;
  to?: string;
}

/**
 * Where the reader is.
 *
 * The last crumb is the current page and is deliberately not a link — linking
 * to where you already are is noise, and screen readers announce it as the
 * current item instead.
 */
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  if (trail.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${crumb.name}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              {last || !crumb.to ? (
                <span aria-current="page" className="line-clamp-1 text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link to={crumb.to} className="hover:text-foreground hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
