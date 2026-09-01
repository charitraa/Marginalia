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

/** Shown when a request succeeded but there is nothing to display. */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      {icon && <div className="mb-4 text-muted-foreground" aria-hidden="true">{icon}</div>}
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action &&
        (action.to ? (
          <Button variant="outline" className="mt-6" asChild>
            <Link to={action.to}>{action.label}</Link>
          </Button>
        ) : (
          <Button variant="outline" className="mt-6" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
