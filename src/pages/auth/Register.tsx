import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/features/auth/components/AuthLayout";
import Seo from "@/components/common/Seo";
import Captcha, { resetCaptcha } from "@/features/captcha/components/Captcha";
import SocialAuthButtons from "@/features/auth/components/SocialAuthButtons";
import PasswordRules, { passwordMeetsRules } from "@/features/auth/components/PasswordRules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { errorMessage, fieldErrors } from "@/lib/errors";
import { SITE_NAME } from "@/config/constants";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const passwordOk = passwordMeetsRules(form.password);
  const matches = form.password === form.confirmPassword;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.first_name = "Enter your first name.";
    if (!form.lastName.trim()) next.last_name = "Enter your last name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    if (!passwordOk) next.password = "Choose a stronger password.";
    if (!matches) next.confirm_password = "Passwords do not match.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        captcha,
      });

      if (result.status === "verification-required") {
        toast.info("Check your email for a verification code.");
        navigate("/verify", { state: { email: result.email } });
        return;
      }

      toast.success("Welcome to " + SITE_NAME + ".");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // A reCAPTCHA token is single-use, so a failed submit needs a fresh one.
      resetCaptcha();
      setCaptcha(null);
      setErrors(fieldErrors(error));
      setFormError(errorMessage(error, "We couldn't create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (
    id: string,
    label: string,
    key: keyof typeof form,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={form[key]}
        onChange={update(key)}
        aria-invalid={Boolean(errors[props.name ?? id])}
        aria-describedby={errors[props.name ?? id] ? `${id}-error` : undefined}
        className="mt-2"
        {...props}
      />
      {errors[props.name ?? id] && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-destructive">
          {errors[props.name ?? id]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <Seo title="Create an account" canonicalPath="/register" noIndex />

      <AuthLayout
        title="Create your account"
        description={`Join ${SITE_NAME} to save what you read and publish what you write.`}
        statement="A margin is where the reader answers back."
        footer={
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary">
              Sign in
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

            <div className="grid gap-5 sm:grid-cols-2">
              {field("first_name", "First name", "firstName", {
                name: "first_name",
                autoComplete: "given-name",
                placeholder: "Ada",
              })}
              {field("last_name", "Last name", "lastName", {
                name: "last_name",
                autoComplete: "family-name",
                placeholder: "Lovelace",
              })}
            </div>

            {field("username", "Username", "username", {
              name: "username",
              autoComplete: "username",
              placeholder: "Optional — we'll generate one",
            })}

            {field("email", "Email address", "email", {
              name: "email",
              type: "email",
              autoComplete: "email",
              placeholder: "you@example.com",
            })}

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={update("password")}
                aria-invalid={Boolean(errors.password)}
                aria-describedby="password-rules"
                className="mt-2"
              />
              <PasswordRules id="password-rules" value={form.password} />
              {errors.password && (
                <p className="mt-1.5 text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                aria-invalid={Boolean(errors.confirm_password)}
                className="mt-2"
              />
              {(errors.confirm_password || (form.confirmPassword && !matches)) && (
                <p className="mt-1.5 text-sm text-destructive">
                  {errors.confirm_password ?? "Passwords do not match."}
                </p>
              )}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              By creating an account you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <Captcha onChange={setCaptcha} error={errors.captcha} />

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <SocialAuthButtons label="or sign up with" />
      </AuthLayout>
    </>
  );
}
