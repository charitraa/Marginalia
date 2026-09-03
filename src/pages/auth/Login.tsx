import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/features/auth/components/AuthLayout";
import Seo from "@/components/common/Seo";
import SocialAuthButtons from "@/features/auth/components/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { errorMessage, fieldErrors } from "@/lib/errors";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ProtectedRoute records where the guest was headed so we can return them.
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError("");

    if (!identifier.trim() || !password) {
      setErrors({
        ...(identifier.trim() ? {} : { email: "Enter your email or username." }),
        ...(password ? {} : { password: "Enter your password." }),
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(identifier.trim(), password);
      if (result.status === "verification-required") {
        toast.info(result.message);
        navigate("/verify", { state: { email: result.email } });
        return;
      }
      toast.success("Welcome back.");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors(fieldErrors(error));
      setFormError(errorMessage(error, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Sign in" canonicalPath="/login" noIndex />

      <AuthLayout
        title="Welcome back"
        description="Sign in to keep reading, saving and writing."
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary">
              Create one
            </Link>
          </>
        }
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
              <Label htmlFor="identifier">Email or username</Label>
              <Input
                id="identifier"
                name="identifier"
                autoComplete="username"
                placeholder="you@example.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "identifier-error" : undefined}
                className="mt-2"
              />
              {errors.email && (
                <p id="identifier-error" className="mt-1.5 text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="mt-2"
              />
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <SocialAuthButtons label="or continue with" />
      </AuthLayout>
    </>
  );
}
