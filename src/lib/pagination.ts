import { env } from "@/env";

/**
 * Home-listing pagination. The blog is fully static, so pages are real routes
 * baked at build time: page 1 is `/`, further pages are `/page/2`, `/page/3`…
 * — every post stays reachable by a crawlable URL (which is the point, for
 * search + AI indexing). Page size comes from `SITE_PAGE_SIZE` (default 12).
 */

/** Posts shown per page on the home listing. */
export const PAGE_SIZE = env.pageSize;

/** Total number of pages for a given post count (always at least 1). */
export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

/** The slice of items that belongs on page `page` (1-based). */
export function pageSlice<T>(items: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

/** Canonical href for a page: page 1 is the home root, others are `/page/N`. */
export function pageHref(page: number): string {
  return page <= 1 ? "/" : `/page/${page}`;
}

/**
 * The tokens to render in the pager: first and last page always, a window
 * around the current page, and `"ellipsis"` gaps between — e.g. for current 6
 * of 20: `1 … 5 6 7 … 20`. Keeps the control compact however many pages exist.
 */
export function pageItems(current: number, total: number): Array<number | "ellipsis"> {
  const WINDOW = 1;
  const keep = (p: number) =>
    p === 1 || p === total || (p >= current - WINDOW && p <= current + WINDOW);
  const out: Array<number | "ellipsis"> = [];
  let last = 0;
  for (let p = 1; p <= total; p++) {
    if (!keep(p)) continue;
    if (last && p - last > 1) out.push("ellipsis");
    out.push(p);
    last = p;
  }
  return out;
}
