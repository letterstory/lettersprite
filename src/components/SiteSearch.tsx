"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/Link";

/** Slim, serializable post index passed from the server header. */
export type SearchItem = {
  slug: string;
  title: string;
  section: string;
  excerpt: string;
  tags: string[];
};

/**
 * Masthead search. A visible input that (a) previews the top matches in a live
 * dropdown as you type, and (b) on submit takes you to the full `/search`
 * results page — the hybrid of instant feedback + a complete results view.
 *
 * Fully keyboard-native — it's an ARIA combobox over a listbox of results:
 *   ↓ / ↑        move the highlight between articles (↓ from the box opens it)
 *   Home / End   jump to the first / last result
 *   Enter        open the highlighted article, or (nothing highlighted) the
 *                full results page
 *   Esc          close the dropdown (again: blur the box)
 * Focus stays on the input and the active row is tracked via
 * `aria-activedescendant`, so keyboard and screen-reader users move between
 * articles without touching the mouse. Shared component → every site gets it.
 *
 * Client-side over the build-time index, so it works on the fully static
 * deployments. Styled from theme CSS vars, so it matches every theme.
 */
export function SiteSearch({
  index,
  className = "",
  trending,
}: {
  index: SearchItem[];
  className?: string;
  /**
   * When provided, focusing the empty box drops open a "Trending" shortlist so
   * there's always something to browse or arrow into before you type. Omit it
   * and the box behaves classically (dropdown only appears once you type).
   */
  trending?: SearchItem[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  // The highlighted result for keyboard navigation. -1 = the input itself
  // (nothing highlighted); 0..preview.length-1 = a result row.
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stable ids for the ARIA combobox wiring (listbox + per-option).
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  // Keyboard shortcuts: "/" focuses search (unless already typing somewhere),
  // and ⌘K / Ctrl+K from anywhere. Only the currently-visible instance of the
  // box responds, so the hidden mobile/desktop copies don't steal the key.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = inputRef.current;
      if (!el || el.offsetParent === null) return; // this instance is hidden
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        el.focus();
        return;
      }
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        el.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const query = q.trim();

  const matches = useMemo(() => {
    const needle = query.toLowerCase();
    if (!needle) return [];
    return index.filter(
      (it) =>
        it.title.toLowerCase().includes(needle) ||
        it.section.toLowerCase().includes(needle) ||
        it.excerpt.toLowerCase().includes(needle) ||
        it.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [query, index]);

  const preview = matches.slice(0, 5);

  // The rows the dropdown is currently showing: search matches once you've
  // typed, the optional Trending shortlist while the query is empty. Keyboard
  // and mouse both navigate whichever list is live.
  const trend = useMemo(() => (trending ?? []).slice(0, 6), [trending]);
  const rows = query ? preview : trend;
  const showDropdown = open && (query ? true : trend.length > 0);

  // Re-typing re-ranks the list, so any prior highlight is stale — reset it.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  function goToResults() {
    if (!query) return;
    setOpen(false);
    setActiveIndex(-1);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function goToArticle(slug: string) {
    setOpen(false);
    setActiveIndex(-1);
    router.push(`/posts/${slug}`);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (open) {
        setOpen(false);
        setActiveIndex(-1);
      } else {
        inputRef.current?.blur();
      }
      return;
    }
    if (!query && rows.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        // Open on the first press; then walk down, clamping at the last row.
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) =>
          rows.length === 0 ? -1 : Math.min(i + 1, rows.length - 1),
        );
        break;
      case "ArrowUp":
        // Walk up; past the top returns to the input (nothing highlighted).
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? -1 : i - 1));
        break;
      case "Home":
        if (open && rows.length) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open && rows.length) {
          e.preventDefault();
          setActiveIndex(rows.length - 1);
        }
        break;
      case "Enter":
        // A highlighted row opens that article (a search match or a trending
        // item); with a query but nothing highlighted the form submits to the
        // full results page (the default behaviour).
        if (activeIndex >= 0 && rows[activeIndex]) {
          e.preventDefault();
          goToArticle(rows[activeIndex].slug);
        }
        break;
    }
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        goToResults();
      }}
      className={`relative ${className}`}
    >
      <div className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3 py-1.5 focus-within:border-primary">
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => {
              setOpen(false);
              setActiveIndex(-1);
            }, 150);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="Search articles…"
          className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          aria-label="Search articles"
        />
        {/* "/" hint — hidden once focused or typing, and on narrow boxes. */}
        {!focused && !q && (
          <kbd className="pointer-events-none hidden shrink-0 rounded border border-border px-1.5 font-mono text-[0.7rem] leading-5 text-muted sm:inline-block">
            /
          </kbd>
        )}
      </div>

      {showDropdown && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-[var(--radius)] border border-border bg-background shadow-xl shadow-black/10">
          {/* "Trending" heading before you type; results speak for themselves. */}
          {!query && (
            <p className="border-b border-border bg-surface px-4 py-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">
              Trending
            </p>
          )}
          {query && preview.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">No articles match “{query}”.</p>
          ) : (
            <ul
              id={listboxId}
              role="listbox"
              aria-label={query ? "Search results" : "Trending articles"}
              className="divide-y divide-border"
            >
              {rows.map((it, i) => (
                <li key={it.slug}>
                  <Link
                    id={optionId(i)}
                    role="option"
                    aria-selected={activeIndex === i}
                    tabIndex={-1}
                    href={`/posts/${it.slug}`}
                    // Highlighted row uses the theme primary — a solid accent bar
                    // plus a light primary tint — so keyboard users clearly see
                    // which article is active. The 2px bar is reserved on every row
                    // (transparent) so selecting one never shifts the text.
                    className={`flex items-baseline gap-3 border-l-2 px-4 py-2.5 transition-colors ${
                      activeIndex === i
                        ? "border-primary bg-[color-mix(in_oklab,var(--primary)_12%,var(--surface))]"
                        : "border-transparent hover:bg-surface"
                    }`}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {/* A rank numeral gives the trending list its "list" feel. */}
                    {!query && (
                      <span className="font-display text-sm font-bold leading-5 text-primary/70">
                        {i + 1}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block font-heading text-[0.65rem] uppercase tracking-[0.18em] text-primary">
                        {it.section}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold leading-snug text-heading">
                        {it.title}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {/* Full-results affordance — only meaningful once there's a query. */}
          {query && (
            <button
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
              className="block w-full border-t border-border bg-surface px-4 py-2.5 text-left font-heading text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-background"
            >
              {matches.length > 0
                ? `See all ${matches.length} result${matches.length === 1 ? "" : "s"} →`
                : "Search all articles →"}
            </button>
          )}
        </div>
      )}
    </form>
  );
}
