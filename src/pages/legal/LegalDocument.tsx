import type { ReactNode } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";

export interface LegalSection {
  /** Anchor id. Also what the margin index links to. */
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  summary: string;
  updated: string;
  canonicalPath: string;
  sections: LegalSection[];
  /** Closing line under the last section — usually how to reach a human. */
  footnote?: ReactNode;
}

/**
 * The frame the three policy documents share.
 *
 * A policy is still reading, so it gets the reading treatment rather than the
 * dashboard treatment: one measure of text, generous leading, and the section
 * index hanging in the margin on wide screens — the publication's own idiom
 * doing navigation work. Sections are numbered in the gutter, which is what
 * makes a long document scannable without any boxes or cards.
 */
export default function LegalDocument({
  eyebrow,
  title,
  summary,
  updated,
  canonicalPath,
  sections,
  footnote,
}: LegalDocumentProps) {
  return (
    <Layout>
      <Seo title={title} description={summary} canonicalPath={canonicalPath} />

      <div className="container-page">
        <header className="border-b border-foreground/15 pb-12 pt-12 sm:pt-16">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
            {summary}
          </p>
          <p className="mt-8 font-sans text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Last updated {updated}
          </p>
        </header>

        <div className="pb-24 lg:grid lg:grid-cols-[13rem_minmax(0,43rem)] lg:gap-x-16">
          {/* The margin index. Sticky on wide screens, a plain list below. */}
          <nav aria-label="Contents" className="hidden lg:block">
            <div className="sticky top-28 border-r border-border pr-8 pt-14 text-right">
              <p className="eyebrow">Contents</p>
              <ol className="mt-5 space-y-3">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="font-sans text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      <span className="mr-2 tabular-nums text-muted-foreground/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="legal-prose pt-12 lg:pt-14">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                /* The gap lives on the section, not the heading: every heading
                   is the first child of its own section, so `first:` there
                   would have matched all of them and closed every gap. */
                className="mt-16 scroll-mt-28 first:mt-0"
              >
                <h2 className="flex items-baseline gap-4 font-serif text-2xl font-semibold sm:text-3xl">
                  <span
                    aria-hidden="true"
                    className="font-sans text-sm font-medium tabular-nums text-primary"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-5 space-y-5">{section.body}</div>
              </section>
            ))}

            {footnote && (
              <p className="mt-16 border-t border-border pt-8 font-sans text-sm leading-relaxed text-muted-foreground">
                {footnote}
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
