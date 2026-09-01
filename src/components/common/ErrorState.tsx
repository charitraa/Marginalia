import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";

interface ErrorStateProps {
  error: unknown;
  title?: string;
  fallback?: string;
  onRetry?: () => void;
}

/** Shown when a request failed. Never renders raw server output. */
export default function ErrorState({
  error,
  title = "Something went wrong",
  fallback,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/25 bg-destructive/5 px-6 py-14 text-center"
    >
      <AlertCircle className="mb-4 h-8 w-8 text-destructive" aria-hidden="true" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {errorMessage(error, fallback)}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-6 gap-2" onClick={onRetry}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
