import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Small label that hangs in the margin on wide screens. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Actions or filters that belong with the title. */
  children?: ReactNode;
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
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("rail border-b border-foreground/15 pb-10 pt-12 sm:pt-16", className)}>
      <p className="rail-label">{eyebrow}</p>
      <div className="min-w-0">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-5 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
