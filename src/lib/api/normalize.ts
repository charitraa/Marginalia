/**
 * Primitives every feature's normalizers are built from.
 *
 * The API speaks snake_case; the UI speaks the camelCase domain types in each
 * feature's types.ts. Each feature owns the mapping for its own shapes and
 * imports the coercion helpers from here, so "what does an empty string mean"
 * is answered identically everywhere.
 *
 * Counters the API does not send stay null rather than becoming 0: the UI hides
 * the affordance instead of showing a number that isn't real.
 */

import type { Paginated } from "@/types/common";

/** An untyped API payload, before it is mapped onto a domain type. */
export type Raw = Record<string, any>;

/** A non-blank string, or the fallback. */
export function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

/** A real number, or null when the API omitted the counter. */
export function count(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

/** Accepts DRF's {count, next, previous, results} envelope, or a plain array. */
export function normalizePage<T>(
  raw: any,
  map: (item: Raw) => T,
  requestedPage = 1,
  requestedPageSize?: number,
): Paginated<T> {
  if (Array.isArray(raw)) {
    return {
      items: raw.map(map),
      count: raw.length,
      page: 1,
      pageSize: requestedPageSize ?? raw.length,
      hasNext: false,
      hasPrevious: false,
    };
  }

  const results = Array.isArray(raw?.results) ? raw.results : [];
  const items = results.map(map);
  const pageSize = requestedPageSize ?? items.length;
  return {
    items,
    count: typeof raw?.count === "number" ? raw.count : items.length,
    page: requestedPage,
    pageSize,
    hasNext: Boolean(raw?.next),
    hasPrevious: Boolean(raw?.previous),
  };
}

/** Total pages for a paginated response, for the page-number control. */
export function pageCount(page: Paginated<unknown>): number {
  if (!page.pageSize) return 1;
  return Math.max(1, Math.ceil(page.count / page.pageSize));
}
