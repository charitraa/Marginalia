import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/config/constants";

/**
 * The Marginalia mark.
 *
 * A page's margin rule, three lines of text, and one dot sitting out in the
 * margin beside the first line — a reader's note. The dot is the only element
 * that carries the accent colour, so the mark reads as ink on paper with a
 * single deliberate annotation.
 *
 * Sized in `em` so it tracks whatever type size it is dropped into: the header
 * wordmark and the footer wordmark need no separate sizes.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-[1.15em] w-[1.15em] shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* The note in the margin. */}
      <circle cx="4.6" cy="7" r="2.3" className="fill-primary" />
      {/* The margin rule. */}
      <rect x="8.4" y="2.5" width="1.4" height="19" rx="0.7" className="fill-current opacity-30" />
      {/* Three lines of text, fading down the page. */}
      <rect x="12.6" y="6.3" width="8.4" height="1.4" rx="0.7" className="fill-current opacity-80" />
      <rect x="12.6" y="11.3" width="8.4" height="1.4" rx="0.7" className="fill-current opacity-55" />
      <rect x="12.6" y="16.3" width="5.6" height="1.4" rx="0.7" className="fill-current opacity-35" />
    </svg>
  );
}

/**
 * Mark plus wordmark. The name is real text rather than paths, so it stays
 * selectable, searchable and legible to a screen reader.
 */
export default function Logo({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <LogoMark className={cn("self-center", markClassName)} />
      <span className="font-serif font-bold tracking-tight">{SITE_NAME}</span>
    </span>
  );
}
