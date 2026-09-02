import { List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Heading } from "../hooks/useHeadings";

/**
 * In-page navigation for long articles.
 *
 * Renders nothing below three headings — a contents list for two sections is
 * furniture, not navigation.
 */
export default function TableOfContents({
  headings,
  activeId,
}: {
  headings: Heading[];
  activeId: string;
}) {
  if (headings.length < 3) return null;

  return (
    <nav aria-labelledby="toc-heading" className="text-sm">
      <h2
        id="toc-heading"
        className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        <List className="h-3.5 w-3.5" aria-hidden="true" />
        On this page
      </h2>
      <ul className="space-y-1 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 pl-3 leading-snug transition-colors",
                heading.level === 3 && "pl-6",
                activeId === heading.id
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
