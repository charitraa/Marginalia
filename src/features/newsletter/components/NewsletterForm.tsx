import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import Captcha, { resetCaptcha } from "@/features/captcha/components/Captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as newsletterService from "@/features/newsletter/api/newsletterService";
import { errorMessage } from "@/lib/errors";

/**
 * Newsletter sign-up (double opt-in).
 *
 * The API answers the same way whether or not the address is already
 * subscribed, so the success copy talks about the confirmation email rather
 * than claiming a new subscription — anything more would leak who is on the list.
 */
export default function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);

  const subscribe = useMutation({
    mutationFn: () => newsletterService.subscribe(email.trim(), captcha),
    onSuccess: (message) => {
      toast.success(message);
      setEmail("");
    },
    onError: (error) => {
      // The token is single-use, so a retry needs a fresh one.
      resetCaptcha();
      setCaptcha(null);
      toast.error(errorMessage(error, "Could not sign you up just now."));
    },
  });

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        if (email.trim()) subscribe.mutate();
      }}
    >
      <label htmlFor="newsletter-email" className="mb-2 block text-sm font-medium">
        Get new stories by email
      </label>
      <div className="flex gap-2">
        <Input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={subscribe.isPending} className="gap-2 shrink-0">
          <Mail className="h-4 w-4" aria-hidden="true" />
          {subscribe.isPending ? "Sending…" : "Subscribe"}
        </Button>
      </div>
      <div className="mt-3">
        <Captcha onChange={setCaptcha} />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        We send a confirmation link first, and every email has a one-click unsubscribe.
      </p>
    </form>
  );
}
