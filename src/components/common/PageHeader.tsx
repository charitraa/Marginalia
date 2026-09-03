import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Small label that hangs in the margin on wide screens. */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Actions or filters that belong with the title. */
  children?: ReactNode;
  /** Controls that sit opposite the title — "Clear history", "New series". */
  actions?: ReactNode;
  className?: string;
}

/**
 * The masthead every section page opens with.
 *
 * One component so Explore, Search, a category, an author and the account pages
 * all start on the same line with the same rhythm — the single biggest thing
 * keeping forty-odd screens feeling like one publication.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("rail border-b border-foreground/15 pb-10 pt-12 sm:pt-16", className)}>
      <p className="rail-label">{eyebrow}</p>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
          <div className="min-w-0">
            <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
            {description && (
              <p className="mt-5 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-2">{actions}</div>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}
