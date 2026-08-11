import Link from "next/link";
import { pageHref, pageItems } from "@/lib/pagination";

/**
 * Numbered page navigation for the home listing. Real `<a href>` links to the
 * static `/page/N` routes (page 1 is `/`), so it's crawlable and works without
 * JS. Prev/Next on the ends, first/last always shown with `…` gaps around a
 * window on the current page. Styled from theme tokens; the current page picks
 * up the theme primary. Renders nothing when there's only one page.
 */
export function Pagination({
  page,
  totalPages,
  className = "",
}: {
  page: number;
  totalPages: number;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const items = pageItems(page, totalPages);
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const cell =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-[var(--radius)] border px-3 text-sm transition-colors";
  const link = `${cell} border-border text-foreground hover:border-primary hover:text-primary`;
  const disabled = `${cell} border-border text-muted opacity-40`;

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}
    >
      {prev ? (
        <Link href={pageHref(prev)} rel="prev" aria-label="Previous page" className={link}>
          ‹<span className="ml-1 hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span aria-hidden className={disabled}>
          ‹<span className="ml-1 hidden sm:inline">Prev</span>
        </span>
      )}

      {items.map((it, i) =>
        it === "ellipsis" ? (
          <span key={`gap-${i}`} aria-hidden className="px-1 text-muted">
            …
          </span>
        ) : it === page ? (
          <span
            key={it}
            aria-current="page"
            className={`${cell} border-primary bg-[color-mix(in_oklab,var(--primary)_12%,var(--surface))] font-semibold text-primary`}
          >
            {it}
          </span>
        ) : (
          <Link key={it} href={pageHref(it)} aria-label={`Page ${it}`} className={link}>
            {it}
          </Link>
        ),
      )}

      {next ? (
        <Link href={pageHref(next)} rel="next" aria-label="Next page" className={link}>
          <span className="mr-1 hidden sm:inline">Next</span>›
        </Link>
      ) : (
        <span aria-hidden className={disabled}>
          <span className="mr-1 hidden sm:inline">Next</span>›
        </span>
      )}
    </nav>
  );
}
