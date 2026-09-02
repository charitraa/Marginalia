import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as authService from "@/services/authService";
import { errorMessage } from "@/lib/errors";

/**
 * Starts a password reset.
 *
 * The API deliberately answers identically for a registered and an unknown
 * address, so this page shows the same neutral confirmation either way. Saying
 * "we sent you an email" only when the account exists would turn this form into
 * a way to test which addresses have accounts.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (!email.trim()) {
      setFormError("Enter the email address you signed up with.");
      return;
    }

    setSubmitting(true);
    try {
      setMessage(await authService.requestPasswordReset(email.trim()));
      setSent(true);
    } catch (error) {
      setFormError(errorMessage(error, "Could not start a reset just now."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Seo title="Reset your password" noIndex />

      <div className="container-page flex justify-center py-16">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="space-y-6 text-center">
              <MailCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
              <div className="space-y-2">
                <h1 className="font-serif text-2xl font-bold">Check your inbox</h1>
                <p className="text-sm text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">
                  The link works once and expires shortly, so open it soon.
                </p>
              </div>
              <Button variant="outline" asChild className="gap-2">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to sign in
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 space-y-2">
                <h1 className="font-serif text-3xl font-bold">Forgot your password?</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send a link to choose a new one.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {formError && (
                  <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Send reset link
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link to="/login" className="font-medium text-foreground hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
