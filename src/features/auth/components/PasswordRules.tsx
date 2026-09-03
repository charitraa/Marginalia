import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mirrors the server's password validators so failures surface before submit. */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "letter", label: "Contains a letter", test: (value: string) => /[a-zA-Z]/.test(value) },
  { id: "number", label: "Contains a number", test: (value: string) => /\d/.test(value) },
];

export function passwordMeetsRules(value: string) {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

/**
 * The requirements a password has to meet, checked live as it is typed.
 *
 * Shown as a checklist rather than a strength bar: a bar grades you, a list
 * tells you what to do. Met rules take the accent and a tick; unmet ones stay
 * quiet rather than turning red, because an unfinished password is not an
 * error yet.
 */
export default function PasswordRules({
  value,
  id,
  className,
}: {
  value: string;
  id?: string;
  className?: string;
}) {
  return (
    <ul id={id} className={cn("mt-2.5 space-y-1.5", className)}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2 font-sans text-xs transition-colors duration-200",
              met ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                met ? "border-primary bg-primary/10" : "border-border",
              )}
            >
              {met && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
            {rule.label}
            <span className="sr-only">{met ? " — met" : " — not met yet"}</span>
          </li>
        );
      })}
    </ul>
  );
}
