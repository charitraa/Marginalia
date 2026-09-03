import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/features/auth/components/AuthLayout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import * as authService from "@/features/auth/api/authService";
import { errorMessage } from "@/lib/errors";
import { landingPath } from "@/lib/routes";

/**
 * Where GitHub and Google send the browser back to.
 *
 * The `code` in the URL is forwarded to the API, which does the token exchange
 * with the client secret — that secret never exists in this bundle. The `state`
 * is compared against the value this browser stored before leaving, so a code
 * planted by another page is refused rather than exchanged.
 */
export default function OAuthCallback() {
  const { provider = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const [error, setError] = useState("");
  // React 18 mounts effects twice in development; a one-time code must only be
  // exchanged once or the second attempt fails against the provider.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const denied = params.get("error");

    if (denied) {
      setError("Sign-in was cancelled.");
      return;
    }
    if (!code) {
      setError("That sign-in link is missing its authorization code.");
      return;
    }
    if (!authService.consumeOauthState(provider, state)) {
      setError("This sign-in could not be verified. Please start again.");
      return;
    }

    (async () => {
      try {
        const outcome = await authService.socialLogin(provider, code);
        if (outcome.status === "verification-required") {
          navigate("/verify", { replace: true, state: { email: outcome.email } });
          return;
        }
        const current = await refresh();
        toast.success("Signed in.");
        navigate(landingPath(current), { replace: true });
      } catch (err) {
        setError(errorMessage(err, "Could not complete that sign-in."));
      }
    })();
  }, [navigate, params, provider, refresh]);

  return (
    <>
      <Seo title="Signing you in" noIndex />

      <AuthLayout
        title={error ? "Sign-in didn't finish" : "Signing you in"}
        statement="Almost there."
      >
        {error ? (
          <div className="space-y-5">
            <p className="font-sans text-sm leading-relaxed text-muted-foreground">{error}</p>
            <Button asChild>
              <Link to="/login">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
            <p className="font-sans text-sm text-muted-foreground">Finishing your sign-in…</p>
          </div>
        )}
      </AuthLayout>
    </>
  );
}
