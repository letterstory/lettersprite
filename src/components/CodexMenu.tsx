"use client";

import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { env } from "@/env";
import { sectionHref } from "@/lib/editorial";

/**
 * The codex masthead's hamburger drawer — a full-height black panel sliding
 * in from the left, over a dimmed backdrop: a top group of real site nav
 * (Home, Latest, Following, every section with posts, Search), a bottom
 * group of utility links (Sign in, About), and a social row when the site
 * has one configured. Rows are separated by a dotted rule. Closes on a link
 * click, backdrop click, or Escape.
 */
export function CodexMenu({ sections }: { sections: string[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[70] flex flex-col gap-[3px] p-1"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <>
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
            <span className="block h-[2px] w-5 bg-current" />
          </>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[65] bg-black/60"
            aria-hidden
            onClick={close}
          />
          <div className="fixed inset-y-0 left-0 z-[68] flex w-full max-w-xs flex-col overflow-y-auto border-r border-[#2e2e2e] bg-black px-6 py-7 text-white sm:max-w-sm">
            <nav className="mt-14 flex flex-1 flex-col">
              <Link
                href="/"
                onClick={close}
                className="border-b border-dashed border-[#3a3a3a] py-3 text-base transition-colors hover:text-white/70"
              >
                Home
              </Link>
              <Link
                href="/latest"
                onClick={close}
                className="border-b border-dashed border-[#3a3a3a] py-3 text-base transition-colors hover:text-white/70"
              >
                Latest
              </Link>
              <Link
                href="/following"
                onClick={close}
                className="border-b border-dashed border-[#3a3a3a] py-3 text-base transition-colors hover:text-white/70"
              >
                Following
              </Link>
              {sections.map((s) => (
                <Link
                  key={s}
                  href={sectionHref(s)}
                  onClick={close}
                  className="border-b border-dashed border-[#3a3a3a] py-3 text-base transition-colors hover:text-white/70"
                >
                  {s}
                </Link>
              ))}
              <Link
                href="/search"
                onClick={close}
                className="border-b border-dashed border-[#3a3a3a] py-3 text-base transition-colors hover:text-white/70"
              >
                Search
              </Link>

              <div className="flex-1" />

              {env.newsletterEnabled && (
                <a
                  href="#newsletter"
                  onClick={close}
                  className="flex items-center gap-2 border-b border-dashed border-[#3a3a3a] py-3 text-sm text-white/70 transition-colors hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
                  </svg>
                  Sign in
                </a>
              )}
              <Link
                href="/about"
                onClick={close}
                className="border-b border-dashed border-[#3a3a3a] py-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                About us
              </Link>

              {env.twitterHandle && (
                <div className="flex items-center gap-4 pt-5">
                  <a
                    href={`https://twitter.com/${env.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                      <path d="M18.9 1.6h3.5l-7.6 8.7L23.7 22h-7l-5.5-7.2L4.9 22H1.4l8.1-9.3L.7 1.6h7.2l5 6.6 5.9-6.6Zm-1.2 18.3h1.9L6.9 3.6H4.8l12.9 16.3Z" />
                    </svg>
                  </a>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
