import { Link } from "react-router-dom";
import NewsletterForm from "@/features/newsletter/components/NewsletterForm";
import Logo from "@/components/common/Logo";
import { SITE_NAME } from "@/config/constants";

const SECTIONS = [
  {
    title: "Read",
    links: [
      { to: "/explore", label: "Explore" },
      { to: "/trending", label: "Trending" },
      { to: "/series", label: "Series" },
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

/**
 * The colophon. Ends the page on the publication's name rather than trailing off
 * into a wall of links: the masthead and its line sit on their own, and the
 * navigation is set small beside them.
 */
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-foreground/15">
      <div className="container-page py-16">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            <Link to="/" className="text-xl" aria-label={`${SITE_NAME} home`}>
              <Logo />
            </Link>
            <p className="mt-4 max-w-measure font-serif text-xl leading-snug text-foreground/80">
              Notes, ideas and stories worth reading.
            </p>

            <div className="mt-10 max-w-md border-t border-border pt-8">
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {SECTIONS.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h2 className="eyebrow">{section.title}</h2>
                <ul className="mt-5 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="font-sans text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p className="mt-16 border-t border-border pt-7 font-sans text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
