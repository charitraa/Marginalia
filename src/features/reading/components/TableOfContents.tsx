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
      <h2 id="toc-heading" className="eyebrow mb-4">
        On this page
      </h2>
      <ul className="space-y-0.5 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1.5 pl-4 font-sans leading-snug transition-colors duration-200",
                heading.level === 3 && "pl-6",
                activeId === heading.id
                  ? "border-primary text-foreground"
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
