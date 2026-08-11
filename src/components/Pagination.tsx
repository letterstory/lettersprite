import Link from "next/link";
import { pageHref, pageItems } from "@/lib/pagination";

/**
 * Numbered page navigation for the home listing, styled editorially rather than
 * as boxed app buttons: a hairline rule above, "Newer / Older" in letter-spaced
 * masthead caps on the flanks, and plain numerals in the middle with the current
 * page underlined in the theme primary. Real `<a href>` links to the static
 * `/page/N` routes (page 1 is `/`), so it's crawlable and works without JS.
 * Renders nothing when there's a single page.
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

  const edge =
    "font-heading text-xs font-semibold uppercase tracking-[0.2em] transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-border pt-10 ${className}`}
    >
      {prev ? (
        <Link href={pageHref(prev)} rel="prev" className={`${edge} text-muted hover:text-primary`}>
          ← <span className="hidden sm:inline">Newer</span>
        </Link>
      ) : (
        <span aria-hidden className={`${edge} text-muted opacity-40`}>
          ← <span className="hidden sm:inline">Newer</span>
        </span>
      )}

      <ol className="flex items-center gap-5 text-sm tabular-nums">
        {items.map((it, i) =>
          it === "ellipsis" ? (
            <li key={`gap-${i}`} aria-hidden className="text-muted">
              …
            </li>
          ) : (
            <li key={it}>
              {it === page ? (
                <span
                  aria-current="page"
                  className="font-semibold text-primary underline decoration-2 underline-offset-[6px]"
                >
                  {it}
                </span>
              ) : (
                <Link
                  href={pageHref(it)}
                  aria-label={`Page ${it}`}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {it}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>

      {next ? (
        <Link href={pageHref(next)} rel="next" className={`${edge} text-muted hover:text-primary`}>
          <span className="hidden sm:inline">Older</span> →
        </Link>
      ) : (
        <span aria-hidden className={`${edge} text-muted opacity-40`}>
          <span className="hidden sm:inline">Older</span> →
        </span>
      )}
    </nav>
  );
}
