import { useEffect } from "react";

/**
 * Adds a copy button to every code block in rendered article HTML.
 *
 * Done by walking the DOM after render rather than by rewriting the stored
 * HTML: the article body is sanitised and belongs to the author, and a UI
 * affordance has no business being baked into it.
 */
export function useCopyCodeButtons(
  containerRef: React.RefObject<HTMLElement>,
  content: string,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanups: Array<() => void> = [];

    container.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector("[data-copy-code]")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.copyCode = "true";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code to clipboard");
      button.className =
        "absolute right-2 top-2 rounded border border-border bg-background/90 px-2 py-1 " +
        "text-xs text-muted-foreground opacity-0 transition-opacity focus:opacity-100 " +
        "group-hover:opacity-100 hover:text-foreground";

      const onClick = async () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
        } catch {
          button.textContent = "Press Ctrl+C";
        }
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 2000);
      };

      button.addEventListener("click", onClick);
      pre.classList.add("group", "relative");
      pre.appendChild(button);

      cleanups.push(() => {
        button.removeEventListener("click", onClick);
        button.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [containerRef, content]);
}
