import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Either a handler or a destination; `to` renders a real link. */
  action?: { label: string; onClick?: () => void; to?: string } | null;
  children?: ReactNode;
}

/**
 * Shown when a request succeeded but there is nothing to display.
 *
 * An empty shelf, not an error: hairlines top and bottom, a serif line of type
 * and a way forward. No dashed box, no illustration — nothing here is broken.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="border-y border-border px-6 py-20 text-center">
      {icon && (
        <div className="mb-5 flex justify-center text-muted-foreground/60" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-2xl font-semibold">{title}</h3>
      {description && (
        <p className="mx-auto mt-3 max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action &&
        (action.to ? (
          <Button variant="outline" className="mt-7" asChild>
            <Link to={action.to}>{action.label}</Link>
          </Button>
        ) : (
          <Button variant="outline" className="mt-7" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
      {children && <div className="mt-7 flex justify-center">{children}</div>}
    </div>
  );
}
