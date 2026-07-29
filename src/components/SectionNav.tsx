"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { sectionHref } from "@/lib/editorial";

/**
 * The masthead section bar, kept to a single line with an exact "More" overflow.
 *
 * A phantom can own 6-9 pillars of wildly varying label width, so a fixed inline
 * count either wraps or strands "More". Instead we MEASURE the real rendered
 * links: they are `shrink-0`, so even where the (overflow-hidden) bar clips them
 * they keep their intrinsic width. On mount we capture every link's width while
 * all are on screen, then fit as many as the width-bounded bar allows —
 * reserving room for "More" — and hide the exact remainder into a dropdown.
 * Measuring against the stable `<nav>` width (not the clip, whose width changes
 * when "More" appears) avoids a feedback loop.
 *
 * Pre-hydration every link renders (clipped, never wrapped); the effect then
 * trims. If measurement ever fails, we fall back to a conservative inline count
 * plus "More" — never an untrimmed, menu-less clipped row.
 */

const GAP_PX = 24; // gap-x-6 (1.5rem)
const SAFETY_PX = 8; // guard against sub-pixel rounding

export function SectionNav({
  sections,
  className = "",
  align = "start",
}: {
  sections: string[];
  className?: string;
  align?: "start" | "center";
}) {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const moreRef = useRef<HTMLDivElement>(null);
  const widthsRef = useRef<number[]>([]);
  const moreWRef = useRef(72);
  const [visible, setVisible] = useState(sections.length);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Capture intrinsic widths while all links are on screen (only the first
    // pass, before any are hidden, yields non-zero widths for every link).
    const capture = () => {
      const ws = linkRefs.current.slice(0, sections.length).map((el) => el?.getBoundingClientRect().width ?? 0);
      if (ws.length === sections.length && ws.every((w) => w > 0)) {
        widthsRef.current = ws;
        const mw = moreRef.current?.getBoundingClientRect().width ?? 0;
        if (mw > 0) moreWRef.current = mw;
      }
    };

    const compute = () => {
      const ws = widthsRef.current;
      const avail = nav.clientWidth;
      // Measurement not ready / bar not laid out → conservative fallback so we
      // never render an untrimmed clipped row.
      if (avail <= 0 || ws.length !== sections.length || ws.some((w) => w <= 0)) {
        setVisible(Math.min(sections.length, 4));
        return;
      }
      let total = 0;
      for (let i = 0; i < ws.length; i++) total += ws[i] + (i > 0 ? GAP_PX : 0);
      if (total <= avail) {
        setVisible(sections.length);
        return;
      }
      const budget = avail - moreWRef.current - GAP_PX - SAFETY_PX;
      let used = 0;
      let count = 0;
      for (let i = 0; i < ws.length; i++) {
        const next = used + ws[i] + (count > 0 ? GAP_PX : 0);
        if (next > budget) break;
        used = next;
        count++;
      }
      setVisible(Math.max(1, count));
    };

    capture();
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [sections]);

  return (
    <nav
      ref={navRef}
      aria-label="Sections"
      className={`relative flex min-w-0 items-center gap-x-6 ${className}`}
    >
      {/* One-line row. Every link is rendered (so widths stay measurable); those
          past the fold are display:none. overflow-hidden means it can never
          wrap or bleed before the effect trims. */}
      <div className="flex min-w-0 max-w-full flex-nowrap items-center gap-x-6 overflow-hidden">
        {sections.map((s, i) => (
          <Link
            key={s}
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            href={sectionHref(s)}
            className={`kicker kicker-muted ul-link shrink-0 whitespace-nowrap py-0.5 hover:text-primary ${
              i < visible ? "" : "hidden"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {visible < sections.length && (
        <details className="group relative shrink-0">
          <summary className="kicker kicker-muted ul-link flex cursor-pointer list-none items-center gap-1 whitespace-nowrap py-0.5 hover:text-primary [&::-webkit-details-marker]:hidden">
            More
            <span
              aria-hidden
              className="text-[0.85em] transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <ul
            className={`absolute top-full z-50 mt-2 flex min-w-44 flex-col gap-0.5 rounded-[var(--radius)] border border-border bg-background p-1.5 shadow-lg ${
              align === "center" ? "left-1/2 -translate-x-1/2" : "right-0"
            }`}
          >
            {sections.slice(visible).map((s) => (
              <li key={s}>
                <Link
                  href={sectionHref(s)}
                  className="kicker kicker-muted block whitespace-nowrap rounded-[calc(var(--radius)-0.15rem)] px-3 py-1.5 hover:bg-muted/10 hover:text-primary"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Off-screen sizer to measure the "More" control's width. */}
      <div
        ref={moreRef}
        aria-hidden
        className="kicker kicker-muted pointer-events-none invisible absolute left-0 top-0 flex items-center gap-1 whitespace-nowrap py-0.5"
      >
        More <span className="text-[0.85em]">▾</span>
      </div>
    </nav>
  );
}
