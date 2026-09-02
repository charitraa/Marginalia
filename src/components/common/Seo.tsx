import { useEffect } from "react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/config/constants";

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  type?: "website" | "article";
  canonicalPath?: string;
  publishedAt?: string | null;
  author?: string;
  noIndex?: boolean;
}

function upsertMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
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
 * (and every link preview that does) read these; server rendering would be
 * needed for the rest, which this architecture does not have.
 */
export default function Seo({
  title,
  description = SITE_DESCRIPTION,
  image,
  type = "website",
  canonicalPath,
  publishedAt,
  author,
  noIndex = false,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
    document.title = fullTitle;

    const url = canonicalPath
      ? new URL(canonicalPath, window.location.origin).toString()
      : window.location.href.split("?")[0];

    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[name="robots"]', "name", "robots", noIndex ? "noindex,nofollow" : "index,follow");

    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);

    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", image ? "summary_large_image" : "summary");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

    if (image) {
      const absolute = new URL(image, window.location.origin).toString();
      upsertMeta('meta[property="og:image"]', "property", "og:image", absolute);
      upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", absolute);
    }

    if (publishedAt) {
      upsertMeta(
        'meta[property="article:published_time"]',
        "property",
        "article:published_time",
        publishedAt,
      );
    }
    if (author) {
      upsertMeta('meta[property="article:author"]', "property", "article:author", author);
    }

    upsertLink("canonical", url);
  }, [title, description, image, type, canonicalPath, publishedAt, author, noIndex]);

  return null;
}
