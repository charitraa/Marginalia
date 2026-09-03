import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One number on the dashboard.
 *
 * The figure is the loudest thing in the card and the label sits under it, so
 * a row of these scans as data rather than as prose.
 */
export default function StatCard({
  label,
  value,
  hint,
  icon,
  emphasis = false,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ReactNode;
  emphasis?: boolean;
}) {
  const display = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div
      className={cn(
        "border-t pt-4",
        emphasis ? "border-primary" : "border-border",
      )}
    >
      <p className="flex items-center gap-1.5 font-sans text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {icon && (
          <span className="[&>svg]:h-3 [&>svg]:w-3" aria-hidden="true">
            {icon}
          </span>
        )}
        {label}
      </p>
      <p
        className={cn(
          "mt-2.5 font-serif text-4xl font-semibold tabular-nums",
          emphasis && "text-primary",
        )}
      >
        {display}
      </p>
      {hint && (
        <p className="mt-1.5 font-sans text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
