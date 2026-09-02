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
        "rounded-lg border border-border p-4",
        emphasis && "border-primary/40 bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground" aria-hidden="true">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{display}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
