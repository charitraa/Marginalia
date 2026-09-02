import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getPendingVerification, resendCode } from "@/features/auth/api/authService";
import { errorMessage } from "@/lib/errors";

const RESEND_SECONDS = 30;

/**
 * Confirms the six-digit code the API emails to a new or changed address.
 * The address is carried in router state, falling back to the value stored
 * when the code was requested, so a refresh does not strand the user.
 */
export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();

  const stateEmail = (location.state as { email?: string } | null)?.email;
  const [email, setEmail] = useState(stateEmail ?? getPendingVerification());
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (code.trim().length !== 6) {
      setFormError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyEmail(email.trim(), code.trim());
      toast.success("Email verified.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFormError(errorMessage(error, "That code isn't valid or has expired."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendCode(email.trim());
      setCooldown(RESEND_SECONDS);
      toast.success("If that address needs verification, a new code is on its way.");
    } catch (error) {
      toast.error(errorMessage(error, "We couldn't send a new code."));
    }
  };

  return (
    <Layout>
      <Seo title="Verify your email" canonicalPath="/verify" noIndex />

      <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <MailCheck className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden="true" />
            <h1 className="text-3xl sm:text-4xl">Check your email</h1>
            <p className="mt-2 text-muted-foreground">
              We sent a 6-digit code{email ? ` to ${email}` : ""}. Enter it below to finish signing in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {formError && (
              <p
                role="alert"
                className="rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {formError}
              </p>
            )}

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="mt-2 text-center text-2xl tracking-[0.4em]"
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                "Verify and continue"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={handleResend}
              disabled={cooldown > 0 || !email.trim()}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Wrong address?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Start over
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
