import { useQuery } from "@tanstack/react-query";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as authService from "@/services/authService";
import type { SocialProvider } from "@/types/blog";

/**
 * Sign-in buttons for the providers this deployment has credentials for.
 *
 * The list comes from the API, so a provider that is not configured renders no
 * button at all rather than one that fails on click. Nothing is shown while the
 * list is loading, which keeps the form from jumping.
 */

const LABELS: Record<SocialProvider["name"], string> = {
  github: "Continue with GitHub",
  google: "Continue with Google",
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function SocialAuthButtons({ label = "or" }: { label?: string }) {
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["auth", "providers"],
    queryFn: authService.listSocialProviders,
    // Which providers exist changes only on a deploy.
    staleTime: 10 * 60_000,
    retry: false,
  });

  if (isLoading || providers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-2">
        {providers.map((provider) => (
          <Button
            key={provider.name}
            type="button"
            variant="outline"
            className="w-full gap-2"
            // A full page navigation, not fetch: the consent screen is the
            // provider's own page and must own the address bar.
            onClick={() => {
              window.location.href = authService.buildAuthorizeUrl(provider);
            }}
          >
            {provider.name === "github" ? (
              <Github className="h-4 w-4" aria-hidden="true" />
            ) : (
              <GoogleMark />
            )}
            {LABELS[provider.name]}
          </Button>
        ))}
      </div>
    </div>
  );
}
