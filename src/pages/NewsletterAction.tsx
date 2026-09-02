import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import * as newsletterService from "@/services/newsletterService";
import { errorMessage } from "@/lib/errors";

/**
 * Handles both halves of the double opt-in link: confirming a subscription and
 * unsubscribing. Neither needs an account — the token in the URL is the whole
 * authorisation, which is what lets a one-click unsubscribe actually be one click.
 */
export default function NewsletterAction({ action }: { action: "confirm" | "unsubscribe" }) {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [state, setState] = useState<"working" | "done" | "failed">("working");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!token) {
      setState("failed");
      setMessage("That link is missing its token. Please open it straight from your email.");
      return;
    }

    (async () => {
      try {
        const reply =
          action === "confirm"
            ? await newsletterService.confirmSubscription(token)
            : await newsletterService.unsubscribe(token);
        setMessage(reply);
        setState("done");
      } catch (error) {
        setMessage(errorMessage(error, "That link is no longer valid."));
        setState("failed");
      }
    })();
  }, [action, token]);

  const heading =
    action === "confirm" ? "Confirming your subscription" : "Unsubscribing you";

  return (
    <Layout>
      <Seo title={heading} noIndex />

      <div className="container-page flex min-h-[50vh] items-center justify-center py-16">
        <div className="max-w-md space-y-4 text-center">
          {state === "working" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">{heading}…</p>
            </>
          )}

          {state === "done" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
              <h1 className="font-serif text-2xl font-bold">
                {action === "confirm" ? "You're subscribed" : "You're unsubscribed"}
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button asChild>
                <Link to="/explore">Browse stories</Link>
              </Button>
            </>
          )}

          {state === "failed" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" aria-hidden="true" />
              <h1 className="font-serif text-2xl font-bold">That link didn&apos;t work</h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button variant="outline" asChild>
                <Link to="/">Back to the blog</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
