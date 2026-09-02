import { Link } from "react-router-dom";
import NewsletterForm from "@/features/newsletter/components/NewsletterForm";
import Logo from "@/components/common/Logo";
import { SITE_NAME, SITE_TAGLINE } from "@/config/constants";

const SECTIONS = [
  {
    title: "Read",
    links: [
      { to: "/explore", label: "Explore" },
      { to: "/trending", label: "Trending" },
      { to: "/search", label: "Search" },
    ],
  },
  {
    title: "Site",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/cookies", label: "Cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/30">
      <div className="container-page py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="text-lg" aria-label={`${SITE_NAME} home`}>
              <Logo />
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE_TAGLINE} A quiet corner of the internet for thoughtful writing.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <NewsletterForm className="max-w-md" />
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
