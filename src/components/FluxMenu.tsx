"use client";

import { useEffect, useState } from "react";
import Link from "@/components/Link";

/**
 * The masthead menu button. Toggles a dropdown panel of section + utility links.
 * Closes on link click, outside click, or Escape.
 */
export function FluxMenu({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 w-6 items-center justify-center text-heading transition-colors hover:text-primary"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-3 w-64 border-2 border-foreground bg-background p-4 shadow-[6px_6px_0_0_var(--fg)]">
            <nav className="flex flex-col">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-2.5 font-display text-sm font-bold uppercase tracking-[0.04em] text-heading transition-colors hover:text-primary"
                >
                  {it.name}
                </Link>
              ))}
              <Link
                href="/latest"
                onClick={() => setOpen(false)}
                className="border-b border-border py-2.5 font-display text-sm font-bold uppercase tracking-[0.04em] text-heading transition-colors hover:text-primary"
              >
                Latest
              </Link>
              <a
                href="#newsletter"
                onClick={() => setOpen(false)}
                className="mt-3 block bg-primary px-3 py-2.5 text-center font-display text-sm font-bold uppercase tracking-[0.04em] text-[color:var(--primary-fg)] transition-opacity hover:opacity-90"
              >
                Subscribe
              </a>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
