import { useEffect } from "react";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TAGLINE,
  siteOrigin,
} from "@/config/constants";

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  canonicalPath?: string;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  author?: string;
  noIndex?: boolean;
}

/** Roughly what a result page will show before it truncates. */
const DESCRIPTION_LIMIT = 160;

function clamp(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= DESCRIPTION_LIMIT) return clean;
  const cut = clean.slice(0, DESCRIPTION_LIMIT - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}

/**
 * Writes one meta tag, or removes it when there is no content.
 *
 * Removal matters as much as writing: the tags live on `document.head`, which
 * outlives the route, so a value left behind from the previous page (a post's
 * cover image, its publication date) would be attached to the next one.
 */
function setMeta(attribute: "name" | "property", key: string, content?: string | null) {
  const selector = `meta[${attribute}="${key}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    existing?.remove();
    return;
  }

  const tag = existing ?? document.createElement("meta");
  if (!existing) {
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/**
 * Document head management for a client rendered SPA. Crawlers that execute JS
 * (Googlebot among them) read these; server rendering would be needed for the
 * rest, which this architecture does not have. The static defaults in
 * `index.html` are what a scraper that does not run JS falls back to.
 */
export default function Seo({
  title,
  description = SITE_DESCRIPTION,
  image,
  type = "website",
  canonicalPath,
  publishedAt,
  modifiedAt,
  author,
  noIndex = false,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
    document.title = fullTitle;

    const origin = siteOrigin() || window.location.origin;
    // Query strings are filters and campaign tags, not different documents, so
    // the canonical URL is always the bare path.
    const url = new URL(canonicalPath ?? window.location.pathname, origin).toString();
    const summary = clamp(description || SITE_DESCRIPTION);
    const social = new URL(image || SITE_OG_IMAGE, origin).toString();

    setMeta("name", "description", summary);
    setMeta("name", "robots", noIndex ? "noindex,nofollow" : "index,follow");

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", summary);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "en_US");
    setMeta("property", "og:image", social);
    setMeta("property", "og:image:alt", title ? `${title} — ${SITE_NAME}` : SITE_NAME);

    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", summary);
    setMeta("name", "twitter:image", social);

    // Article-only tags: cleared on every other page rather than inherited.
    setMeta("property", "article:published_time", type === "article" ? publishedAt : null);
    setMeta("property", "article:modified_time", type === "article" ? modifiedAt : null);
    setMeta("property", "article:author", type === "article" ? author : null);

    upsertLink("canonical", url);
  }, [title, description, image, type, canonicalPath, publishedAt, modifiedAt, author, noIndex]);

  return null;
}
