/**
 * Build-time SEO artefacts.
 *
 * The app is a client rendered SPA, so two things it cannot do at runtime have
 * to happen here instead:
 *
 *   1. A sitemap. Search engines will not discover a story by executing the
 *      router, so the URLs are listed for them — the static routes always, and
 *      the published posts, authors and categories when the API answers.
 *   2. Absolute social URLs in `index.html`. Scrapers that never run JS read the
 *      shipped HTML, and Open Graph wants absolute URLs.
 *
 * Both need the site's public origin, which only the deployment knows. With
 * VITE_SITE_URL unset the script says so and leaves the build alone — a missing
 * sitemap is a smaller problem than one full of wrong hostnames.
 */

import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve(process.cwd(), "dist/spa");
const SITE_URL = (process.env.VITE_SITE_URL || process.env.SITE_URL || "").replace(/\/+$/, "");
/**
 * Where the API lives. The app itself reads BASE_URL from src/config/constants.ts,
 * so that file is the fallback rather than a second copy of the hostname here.
 */
async function resolveApiUrl() {
  const fromEnv = process.env.VITE_API_BASE_URL || process.env.SITE_API_URL || "";
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  try {
    const constants = await readFile(path.resolve(process.cwd(), "src/config/constants.ts"), "utf8");
    const match = constants.match(/export const BASE_URL\s*=\s*"([^"]*)"/);
    return (match?.[1] ?? "").replace(/\/+$/, "");
  } catch {
    return "";
  }
}

let API_URL = "";

/** Public routes with no parameters, and how much each matters relative to the rest. */
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/explore", priority: "0.9", changefreq: "daily" },
  { path: "/trending", priority: "0.8", changefreq: "daily" },
  { path: "/series", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.4", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies", priority: "0.3", changefreq: "yearly" },
];

/** How many list pages to walk before giving up, so a large blog cannot stall a build. */
const MAX_PAGES = 20;
const PAGE_SIZE = 100;
const REQUEST_TIMEOUT_MS = 10_000;

function xmlEscape(value) {
  return value.replace(/[<>&'"]/g, (char) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char],
  );
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

/** Walks a DRF paginated list, tolerating a plain array as well. */
async function collect(endpoint, params = {}) {
  if (!API_URL) return [];

  const rows = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(`${API_URL}${endpoint}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", String(PAGE_SIZE));
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    const data = await getJson(url.toString());
    const items = Array.isArray(data) ? data : (data?.results ?? []);
    rows.push(...items);

    if (Array.isArray(data) || !data?.next || items.length === 0) break;
  }
  return rows;
}

/** Every URL worth listing, deduplicated by path. */
async function buildEntries() {
  const entries = new Map();
  const add = (loc, lastmod, priority, changefreq) => {
    if (!loc || entries.has(loc)) return;
    entries.set(loc, { loc, lastmod, priority, changefreq });
  };

  for (const route of STATIC_ROUTES) add(route.path, null, route.priority, route.changefreq);

  if (!API_URL) {
    console.warn("[seo] VITE_API_BASE_URL is not set — sitemap covers static routes only.");
    return [...entries.values()];
  }

  try {
    const posts = await collect("/api/posts/", { status: "published" });
    for (const post of posts) {
      // A draft that slipped into the list response is not a public URL.
      if (post?.status && post.status !== "published") continue;
      const slug = post?.slug || post?.id;
      if (!slug) continue;
      add(`/post/${slug}`, post.updated_at || post.published_at || null, "0.8", "weekly");

      const username = post?.author?.username;
      if (username) add(`/author/${username}`, null, "0.5", "weekly");
    }
    console.log(`[seo] ${posts.length} posts from the API.`);
  } catch (error) {
    console.warn(`[seo] Could not list posts (${error.message}) — continuing without them.`);
  }

  try {
    const categories = await collect("/api/categories/");
    for (const category of categories) {
      if (category?.slug) add(`/category/${category.slug}`, null, "0.6", "weekly");
    }
  } catch (error) {
    console.warn(`[seo] Could not list categories (${error.message}) — continuing without them.`);
  }

  return [...entries.values()];
}

function renderSitemap(entries) {
  const urls = entries
    .map(({ loc, lastmod, priority, changefreq }) =>
      [
        "  <url>",
        `    <loc>${xmlEscape(`${SITE_URL}${loc}`)}</loc>`,
        lastmod ? `    <lastmod>${xmlEscape(String(lastmod).slice(0, 10))}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority ? `    <priority>${priority}</priority>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Points the static Open Graph tags at absolute URLs, which is what scrapers want. */
async function absolutiseSocialTags() {
  const file = path.join(OUT_DIR, "index.html");
  const html = await readFile(file, "utf8");

  let next = html.replace(
    /(<meta\s+(?:property|name)="(?:og:image|twitter:image)"\s+content=")\/(?=[^"]*")/g,
    `$1${SITE_URL}/`,
  );
  if (!/property="og:url"/.test(next)) {
    next = next.replace(
      '<meta property="og:site_name"',
      `<meta property="og:url" content="${SITE_URL}/" />\n  <meta property="og:site_name"`,
    );
  }

  if (next !== html) await writeFile(file, next);
}

async function appendSitemapToRobots() {
  const file = path.join(OUT_DIR, "robots.txt");
  const robots = await readFile(file, "utf8");
  if (/^Sitemap:/m.test(robots)) return;
  await writeFile(file, `${robots.trimEnd()}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

async function main() {
  try {
    await access(OUT_DIR);
  } catch {
    console.warn(`[seo] ${OUT_DIR} does not exist — skipping.`);
    return;
  }

  if (!SITE_URL) {
    console.warn(
      "[seo] VITE_SITE_URL is not set, so canonical URLs cannot be built. " +
        "Skipping sitemap.xml and the absolute Open Graph URLs.",
    );
    return;
  }

  API_URL = await resolveApiUrl();

  const entries = await buildEntries();
  await writeFile(path.join(OUT_DIR, "sitemap.xml"), renderSitemap(entries));
  await appendSitemapToRobots();
  await absolutiseSocialTags();

  console.log(`[seo] sitemap.xml written with ${entries.length} URLs for ${SITE_URL}.`);
}

main().catch((error) => {
  // SEO artefacts are not worth failing a deploy over.
  console.warn(`[seo] Skipped: ${error.message}`);
});
