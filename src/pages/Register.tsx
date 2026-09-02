import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import SocialAuthButtons from "@/components/common/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { errorMessage, fieldErrors } from "@/lib/errors";
import { SITE_NAME } from "@/constants";
import { cn } from "@/lib/utils";

/** Mirrors the server's password validators so failures surface before submit. */
const RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "letter", label: "Contains a letter", test: (value: string) => /[a-zA-Z]/.test(value) },
  { id: "number", label: "Contains a number", test: (value: string) => /\d/.test(value) },
];

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

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const passwordOk = RULES.every((rule) => rule.test(form.password));
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
      });

      if (result.status === "verification-required") {
        toast.info("Check your email for a verification code.");
        navigate("/verify", { state: { email: result.email } });
        return;
      }

      toast.success("Welcome to " + SITE_NAME + ".");
      navigate("/dashboard", { replace: true });
    } catch (error) {
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
    <Layout>
      <Seo title="Create an account" canonicalPath="/register" noIndex />

      <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl">Create account</h1>
            <p className="mt-2 text-muted-foreground">
              Join {SITE_NAME} to start sharing your stories.
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
              <ul id="password-rules" className="mt-2 space-y-1">
                {RULES.map((rule) => {
                  const ok = rule.test(form.password);
                  return (
                    <li
                      key={rule.id}
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                      )}
                    >
                      {ok ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
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

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
