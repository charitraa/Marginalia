import { useEffect, useState } from "react";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * Extracts a table of contents from rendered article HTML.
 *
 * Reads the DOM after render rather than parsing the HTML string, because the
 * ids it assigns have to be the ones actually in the document for the anchors
 * to work. Headings written by an author rarely have ids, so they are added
 * here from a slug of the text.
 */
export function useHeadings(containerRef: React.RefObject<HTMLElement>, content: string) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const found: Heading[] = [];
    const seen = new Set<string>();

    container.querySelectorAll("h2, h3").forEach((node) => {
      const text = node.textContent?.trim() ?? "";
      if (!text) return;

      let id = node.id;
      if (!id) {
        const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        id = base || "section";
        // Two sections can share a title; the anchor must still be unique.
        let suffix = 2;
        while (seen.has(id)) id = `${base}-${suffix++}`;
        node.id = id;
      }
      seen.add(id);
      found.push({ id, text, level: node.tagName === "H2" ? 2 : 3 });
    });

    setHeadings(found);
    if (found.length === 0) return;

    // Highlights the heading nearest the top of the viewport as you scroll.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // A band near the top, so a heading counts as "current" once it reaches
      // reading position rather than when it first appears.
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    found.forEach((heading) => {
      const node = document.getElementById(heading.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [containerRef, content]);

  return { headings, activeId };
}
