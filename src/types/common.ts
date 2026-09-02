/** Cross-feature types. Anything domain-specific belongs in that feature's types.ts. */

/** One page of a list endpoint, normalised from DRF's paging envelope. */
export interface Paginated<T> {
  items: T[];
  count: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
