import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";

interface ErrorStateProps {
  error: unknown;
  title?: string;
  fallback?: string;
  onRetry?: () => void;
}

/**
 * Shown when a request failed. Never renders raw server output.
 *
 * Kept quiet on purpose: a full red panel reads as a system crash, when almost
 * every case here is a network blip the reader can retry. The accent is a single
 * rule down the left, in the same idiom as a pulled quote.
 */
export default function ErrorState({
  error,
  title = "Something went wrong",
  fallback,
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="border-l-2 border-destructive py-2 pl-6">
      <h3 className="font-serif text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-measure font-sans text-sm leading-relaxed text-muted-foreground">
        {errorMessage(error, fallback)}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5 gap-2" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
