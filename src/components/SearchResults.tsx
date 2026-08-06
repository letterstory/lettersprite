"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/Link";

export type SearchItem = {
  slug: string;
  title: string;
  section: string;
  excerpt: string;
  tags: string[];
};

/**
 * Full-page results view. Reads the query from the URL (`?q=`) on the client so
 * it works on the fully static deployments, and stays editable so a reader can
 * refine without leaving the page. Filters the build-time index in the browser.
 */
export function SearchResults({ index }: { index: SearchItem[] }) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const query = q.trim();
  const results = useMemo(() => {
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

  return (
    <div className="container-content px-6 py-12 sm:py-16">
      <h1 className="display text-3xl font-black text-heading sm:text-4xl">Search</h1>
      <p className="mt-2 text-muted">Find any article across the publication.</p>

      <div className="mt-6 flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 focus-within:border-primary">
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          autoFocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles, topics, sections…"
          className="w-full bg-transparent text-lg text-foreground placeholder:text-muted focus:outline-none"
          aria-label="Search articles"
        />
      </div>

      <div className="mt-8">
        {!query ? (
          <p className="text-muted">Start typing to search.</p>
        ) : results.length === 0 ? (
          <p className="text-muted">No articles match “{query}”.</p>
        ) : (
          <>
            <p className="mb-4 font-heading text-xs uppercase tracking-[0.18em] text-muted">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
            </p>
            <ul className="divide-y divide-border">
              {results.map((it) => (
                <li key={it.slug}>
                  <Link href={`/posts/${it.slug}`} className="group block py-5">
                    <span className="block font-heading text-[0.7rem] uppercase tracking-[0.2em] text-primary">
                      {it.section}
                    </span>
                    <span className="mt-1 block text-xl font-bold leading-snug text-heading group-hover:text-primary">
                      {it.title}
                    </span>
                    {it.excerpt && (
                      <span className="mt-1.5 block text-sm text-muted excerpt-clamp-2">
                        {it.excerpt}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
