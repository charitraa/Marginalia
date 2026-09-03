import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/features/auth/components/AuthLayout";
import Seo from "@/components/common/Seo";
import PasswordRules, { passwordMeetsRules } from "@/features/auth/components/PasswordRules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";
import * as authService from "@/features/auth/api/authService";
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
      <>
        <Seo title="Reset your password" noIndex />
        <AuthLayout
          title="This link is incomplete"
          description="Open the reset link straight from your email, or request a new one."
          statement="A fresh start, in the same margin."
          footer={
            <>
              Remembered it?{" "}
              <Link
                to="/login"
                className="text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary"
              >
                Sign in
              </Link>
            </>
          }
        >
          <Button asChild>
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <Seo title="Choose a new password" noIndex />

      <AuthLayout
        title="Choose a new password"
        description="Pick something you haven't used elsewhere."
        statement="A fresh start, in the same margin."
      >
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
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                autoFocus
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.new_password)}
                aria-describedby="password-rules"
                className="mt-2"
              />
              <PasswordRules id="password-rules" value={password} />
              {errors.new_password && (
                <p className="mt-1.5 text-sm text-destructive">{errors.new_password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                aria-invalid={Boolean(errors.confirm || errors.new_password_confirm)}
                className="mt-2"
              />
              {(errors.confirm || errors.new_password_confirm || (confirm && password !== confirm)) && (
                <p className="mt-1.5 text-sm text-destructive">
                  {errors.confirm || errors.new_password_confirm || "Both passwords must match."}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={submitting || !passwordMeetsRules(password)}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Update password
            </Button>
          </form>
      </AuthLayout>
    </>
  );
}
