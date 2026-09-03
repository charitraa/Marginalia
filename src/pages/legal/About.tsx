import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, PenLine } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCategories } from "@/features/posts/hooks/usePosts";
import { categoryPath } from "@/lib/routes";
import { MAINTAINER_URL, SITE_NAME, SITE_TAGLINE, SOURCE_URL } from "@/config/constants";

/**
 * The three commitments the publication actually makes. Written as principles
 * rather than features — the features are visible on every other page.
 */
const PRINCIPLES = [
  {
    title: "The reading comes first",
    body: "One column, a comfortable measure, type chosen for long stretches. Nothing pops up mid-paragraph, nothing follows you down the page, and the only thing competing for attention is the next sentence.",
  },
  {
    title: "Written slowly",
    body: "There is no algorithm rewarding volume here, and no feed to feed. A piece is published when it is finished, and it stays findable long after the week it was written in.",
  },
  {
    title: "Yours to keep",
    body: "Your writing stays your writing. Drafts are private until you say otherwise, published work carries your name, and you can take it down as easily as you put it up.",
  },
];

export default function About() {
  const { isAuthenticated } = useAuth();
  const { data: categories, isLoading } = useCategories();

  return (
    <Layout>
      <Seo
        title={`About ${SITE_NAME}`}
        description={`${SITE_NAME} is an independent publication for thoughtful writing about software, design and the thinking behind them.`}
        canonicalPath="/about"
      />

      {/* The definition, then the statement. The word is doing the work here. */}
      <section className="container-page pb-20 pt-16 sm:pt-24">
        <div className="rail">
          <p className="rail-label">About</p>
          <div>
            <p className="font-sans text-sm italic leading-relaxed text-muted-foreground">
              mar·gi·na·li·a <span className="not-italic">·</span> noun
              <span className="not-italic"> — </span>notes written in the margin of a page by
              someone who was reading it closely.
            </p>

            <h1 className="mt-8 max-w-[17ch] font-serif text-display-sm font-semibold">
              A publication for the thought beside the thought.
            </h1>

            <div className="mt-10 max-w-measure space-y-6 font-sans text-lg leading-relaxed text-muted-foreground">
              <p>
                The best part of a secondhand book is rarely the book. It is the previous
                reader — the underline, the question mark, the argument in the margin with an
                author who cannot answer back.
              </p>
              <p>
                {SITE_NAME} is built for that kind of writing: essays, tutorials, notes and
                arguments from people working through something in public. Long enough to be
                worth the time, honest enough to be worth trusting.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page pb-24">
        {/* Principles, numbered in the margin like annotations. */}
        <section>
          <div className="section-head mb-10">
            <h2 className="section-title">What this place is for</h2>
          </div>
          <ol className="grid gap-x-14 gap-y-0 md:grid-cols-3">
            {PRINCIPLES.map((principle, index) => (
              <li key={principle.title} className="border-t border-border py-7 md:border-t-0 md:pt-0">
                <span
                  aria-hidden="true"
                  className="font-sans text-2xs font-medium tabular-nums tracking-[0.14em] text-primary"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-serif text-2xl font-semibold">{principle.title}</h3>
                <p className="mt-3 font-sans text-base leading-relaxed text-muted-foreground">
                  {principle.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Real topics from the API — the publication describing itself by what
            has actually been written, rather than by a claim. */}
        {(isLoading || (categories?.length ?? 0) > 0) && (
          <section className="mt-24">
            <div className="section-head mb-10">
              <h2 className="section-title">What gets written about</h2>
              <Link
                to="/explore"
                className="group/link inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Explore everything
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-200 ease-editorial group-hover/link:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-7 w-32" />
                ))}
              </div>
            ) : (
              <ul className="flex flex-wrap items-baseline gap-x-8 gap-y-4">
                {categories!.map((category) => (
                  <li key={category.slug}>
                    <Link
                      to={categoryPath(category.slug)}
                      className="font-serif text-2xl font-semibold text-foreground/80 transition-colors duration-200 hover:text-primary sm:text-3xl"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Provenance. Small, factual, and honest about what this is. */}
        <section className="mt-24">
          <div className="rail border-t border-foreground/15 pt-8">
            <p className="rail-label">Colophon</p>
            <div className="max-w-measure space-y-5 font-sans text-base leading-relaxed text-muted-foreground">
              <p>
                {SITE_NAME} is an independent project, not a company. It is designed, built and
                maintained by{" "}
                <a
                  href={MAINTAINER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline decoration-primary/50 underline-offset-[3px] transition-colors hover:decoration-primary"
                >
                  Charitra Shrestha
                </a>
                .
              </p>
              <p>
                Set in Fraunces for the writing and Inter for everything around it. Built with
                React and Django; the source is public.
              </p>
              <p>
                <a
                  href={SOURCE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-1.5 text-foreground underline decoration-primary/50 underline-offset-[3px] transition-colors hover:decoration-primary"
                >
                  Read the source on GitHub
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-200 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Closing invitation, set as a pulled quote in the margin idiom. */}
        <section className="mt-24 border-t border-foreground/15 pt-14">
          <div className="max-w-2xl border-l-2 border-primary pl-8">
            <p className="font-serif text-3xl font-semibold leading-[1.15] sm:text-4xl">
              If you have been meaning to write it down, write it here.
            </p>
            <p className="mt-6 font-sans text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {SITE_TAGLINE}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to={isAuthenticated ? "/write" : "/register"}>
                  <PenLine className="h-4 w-4" aria-hidden="true" />
                  Start writing
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/explore">
                  Read something first
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
