import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import * as newsletterService from "@/features/newsletter/api/newsletterService";
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

      {/* Set like the other single-purpose screens: the margin carries the
          label, the statement carries the outcome. No status-circle icons. */}
      <div className="container-page flex min-h-[60vh] items-center py-20">
        <div className="w-full">
          <p className="eyebrow mb-6">Marginalia / Newsletter</p>

          <div className="min-w-0">
            {state === "working" && (
              <div role="status" className="flex items-center gap-3">
                <Loader2
                  className="h-5 w-5 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-sans text-lg text-muted-foreground">{heading}…</p>
              </div>
            )}

            {state === "done" && (
              <div className="border-l-2 border-primary pl-8">
                <h1 className="max-w-[16ch] font-serif text-4xl font-semibold sm:text-5xl">
                  {action === "confirm"
                    ? "You're on the list."
                    : "You're unsubscribed."}
                </h1>
                <p className="mt-6 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
                  {message}
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button asChild className="group gap-2">
                    <Link to="/explore">
                      Browse stories
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 ease-editorial group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                  {action === "unsubscribe" && (
                    <Button variant="outline" asChild>
                      <Link to="/">Back home</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {state === "failed" && (
              <div className="border-l-2 border-destructive pl-8">
                <h1 className="max-w-[18ch] font-serif text-4xl font-semibold sm:text-5xl">
                  That link didn&apos;t work.
                </h1>
                <p className="mt-6 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
                  {message}
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/">Back home</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/contact">Get in touch</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
