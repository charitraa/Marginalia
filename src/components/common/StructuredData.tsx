import { useEffect } from "react";

/**
 * JSON-LD structured data.
 *
 * This is what lets a search engine show an article with its author, date and
 * image rather than a bare blue link. Injected as a script tag and removed on
 * unmount, so navigating between posts never leaves two conflicting
 * descriptions in the document.
 */
export default function StructuredData({ data }: { data: Record<string, unknown> | null }) {
  useEffect(() => {
    if (!data) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.structuredData = "true";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => script.remove();
  }, [data]);

  return null;
}

/** Schema.org describing one article. */
export function articleSchema(options: {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  authorName: string;
  authorUrl: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  siteName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: options.title,
    description: options.description,
    // `mainEntityOfPage` is how a search engine knows which URL is canonical
    // for this content when the same article is reachable more than one way.
    mainEntityOfPage: { "@type": "WebPage", "@id": options.url },
    url: options.url,
    ...(options.image ? { image: [options.image] } : {}),
    author: { "@type": "Person", name: options.authorName, url: options.authorUrl },
    publisher: { "@type": "Organization", name: options.siteName },
    ...(options.publishedAt ? { datePublished: options.publishedAt } : {}),
    ...(options.updatedAt ? { dateModified: options.updatedAt } : {}),
  };
}

/** Schema.org describing a breadcrumb trail. */
export function breadcrumbSchema(trail: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}
