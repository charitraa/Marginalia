import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  /** Shows a spinner while a debounced request is in flight. */
  busy?: boolean;
  id?: string;
  label?: string;
}

/** A labelled search field. Callers debounce the value before requesting. */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search stories…",
  className,
  autoFocus,
  busy = false,
  id = "search",
  label = "Search stories",
}: SearchBarProps) {
  return (
    <form
      role="search"
      className={cn("relative w-full", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        /* Same corner as every other input; the tinted ground is what marks
           it as search, not a pill shape borrowed from another design. */
        className="h-11 border-border bg-muted/50 pl-9 pr-9 focus-visible:bg-background"
      />
      {busy ? (
        <Loader2
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      ) : (
        value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )
      )}
    </form>
  );
}
