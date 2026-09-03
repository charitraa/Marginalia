/**
 * Application wide constants.
 *
 * BASE_URL is empty by default so requests stay same-origin and are forwarded to
 * Django by the dev proxy in vite.config.ts. Set VITE_API_BASE_URL for deployed
 * builds (for example https://api.marginalia.blog).
 */
export const BASE_URL = "https://blog-server-akdq.onrender.com";

/** react-query cache keys, kept from the original services layer. */
export const LOGIN_CACHE_KEY = "login";
export const PROFILE_CACHE_KEY = "profile";
export const EMAIL_CACHE_KEY = "email";

/** Marks that the user chose to be signed in. The token itself never touches storage. */
export const SESSION_FLAG_KEY = "marginalia.session";
/** Email awaiting a verification code, so a refresh does not strand the user. */
export const PENDING_VERIFICATION_KEY = "marginalia.pending-verification";
/** next-themes storage key. */
export const THEME_STORAGE_KEY = "marginalia.theme";
/** Per-tab OAuth state value, compared when the provider redirects back. */
export const OAUTH_STATE_KEY = "marginalia.oauth-state";

export const SITE_NAME = "Marginalia";
/** Where readers reach a human. Used by the contact and legal pages. */
export const CONTACT_EMAIL = "stharabi9862187405@gmail.com";
/** The person behind the publication, and where the code lives. */
export const MAINTAINER_URL = "https://www.charitrashrestha.com.np";
export const SOURCE_URL = "https://github.com/charitraa/Marginalia";
export const SITE_TAGLINE = "Notes in the margins.";
/**
 * Public origin of the deployed site, e.g. `https://marginalia.blog`.
 *
 * Canonical links, Open Graph URLs and structured data have to name the real
 * site rather than whichever host served the bundle: a preview deployment that
 * canonicalises itself competes with production in the index. Left empty in
 * development, where the browser's own origin is the right answer.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/+$/, "");

/** Social preview image for pages that have none of their own. */
export const SITE_OG_IMAGE = "/icon-512.png";

/** The origin absolute URLs are built from. */
export function siteOrigin(): string {
  if (SITE_URL) return SITE_URL;
  return typeof window === "undefined" ? "" : window.location.origin;
}

export const SITE_DESCRIPTION =
  "Thoughtful stories, ideas, tutorials and experiences from the Marginalia community.";

export const POSTS_PER_PAGE = 9;
export const WORDS_PER_MINUTE = 200;

export const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
