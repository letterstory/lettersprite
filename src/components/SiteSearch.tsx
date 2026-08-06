"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
 * Client-side over the build-time index, so it works on the fully static
 * deployments. Styled from theme CSS vars, so it matches every theme.
 */
export function SiteSearch({
  index,
  className = "",
}: {
  index: SearchItem[];
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function goToResults() {
    if (!query) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
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
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") inputRef.current?.blur();
          }}
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

      {open && query && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-[var(--radius)] border border-border bg-background shadow-xl shadow-black/10">
          {preview.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">No articles match “{query}”.</p>
          ) : (
            <ul className="divide-y divide-border">
              {preview.map((it) => (
                <li key={it.slug}>
                  <Link
                    href={`/posts/${it.slug}`}
                    className="block px-4 py-2.5 transition-colors hover:bg-surface"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="block font-heading text-[0.65rem] uppercase tracking-[0.18em] text-primary">
                      {it.section}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold leading-snug text-heading">
                      {it.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {/* Full-results affordance — the "hybrid" step. */}
          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            className="block w-full border-t border-border bg-surface px-4 py-2.5 text-left font-heading text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-background"
          >
            {matches.length > 0
              ? `See all ${matches.length} result${matches.length === 1 ? "" : "s"} →`
              : "Search all articles →"}
          </button>
        </div>
      )}
    </form>
  );
}
