import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/common/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { SITE_NAME } from "@/config/constants";

interface AuthLayoutProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Sits under the form — the "no account yet?" line. */
  footer?: ReactNode;
  /** The editorial line on the brand panel. Defaults to the house statement. */
  statement?: string;
  attribution?: string;
}

/**
 * The frame every sign-in screen shares.
 *
 * A split composition: the publication states itself on the left, the reader
 * does one thing on the right. The brand panel is typography and a single rule
 * — no gradients, no illustration — so it reads as the same publication the
 * reader just came from. Below `lg` the panel drops away entirely and the form
 * gets the whole screen, which is the only thing that matters on a phone.
 */
export default function AuthLayout({
  title,
  description,
  children,
  footer,
  statement = "Every article here started as a note in someone's margin.",
  attribution = "Notes in the margins.",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-muted/40 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-14 xl:p-20">
        <Link to="/" className="text-xl" aria-label={`${SITE_NAME} home`}>
          <Logo />
        </Link>

        {/* The mark's own idiom, enlarged: a margin rule and one annotation. */}
        <div className="relative max-w-lg border-l-2 border-primary pl-8">
          <p className="font-serif text-4xl font-semibold leading-[1.15] xl:text-5xl">{statement}</p>
          <p className="mt-8 font-sans text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {attribution}
          </p>
        </div>

        {/* The panel ends on the statement; nothing else needs to be here. */}
        <div aria-hidden="true" />
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label={`${SITE_NAME} home`}
          >
            <Logo />
          </Link>
          <Link
            to="/"
            className="group hidden items-center gap-1.5 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform duration-200 ease-editorial group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Back to stories
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16 pt-6 sm:px-8">
          <div className="w-full max-w-[25rem]">
            <h1 className="font-serif text-4xl font-semibold">{title}</h1>
            {description && (
              <p className="mt-3 font-sans text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}

            <div className="mt-9">{children}</div>

            {footer && (
              <div className="mt-10 border-t border-border pt-6 font-sans text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
