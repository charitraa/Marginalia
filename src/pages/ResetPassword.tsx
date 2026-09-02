import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import * as authService from "@/services/authService";
import { errorMessage, fieldErrors } from "@/lib/errors";

/**
 * Finishes a password reset using the token from the emailed link.
 *
 * A successful reset also signs the user in, which is why this refreshes the
 * auth context before navigating rather than sending them back to /login.
 */
export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError("");

    if (password !== confirm) {
      setErrors({ confirm: "Both passwords must match." });
      return;
    }

    setSubmitting(true);
    try {
      await authService.confirmPasswordReset(token, password, confirm);
      await refresh();
      toast.success("Password updated. You're signed in.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(errorMessage(error, "That reset link is invalid or has expired."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <Layout>
        <Seo title="Reset your password" noIndex />
        <div className="container-page py-20 text-center">
          <h1 className="font-serif text-2xl font-bold">This link is incomplete</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Open the reset link straight from your email, or request a new one.
          </p>
          <Button asChild className="mt-6">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo title="Choose a new password" noIndex />

      <div className="container-page flex justify-center py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 space-y-2">
            <h1 className="font-serif text-3xl font-bold">Choose a new password</h1>
            <p className="text-sm text-muted-foreground">
              Pick something you haven&apos;t used elsewhere.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {formError && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.new_password)}
              />
              {errors.new_password && (
                <p className="text-sm text-destructive">{errors.new_password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                aria-invalid={Boolean(errors.confirm || errors.new_password_confirm)}
              />
              {(errors.confirm || errors.new_password_confirm) && (
                <p className="text-sm text-destructive">
                  {errors.confirm || errors.new_password_confirm}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Update password
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
