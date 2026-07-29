"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { sectionHref } from "@/lib/editorial";

/**
 * The masthead section bar, as a single non-wrapping line.
 *
 * A phantom can own 6-9 pillars whose labels vary wildly in width, so a fixed
 * "show N inline" cap either wraps to a second row or leaves the "More" button
 * stranded below. Instead we MEASURE: an invisible row renders every label at
 * its natural width, and on mount / resize we fit as many as the bar allows —
 * reserving room for the "More" control — then fold the exact remainder into a
 * dropdown. The result is always one line: inline links, then "More" if (and
 * only if) something didn't fit.
 *
 * Pre-hydration the inline row is clipped (overflow-hidden, no wrap), so the
 * static HTML never bleeds or wraps before the measurement runs; if JS never
 * loads it simply shows what fits with no menu — a safe degradation.
 */

const GAP_PX = 24; // matches gap-x-6 (1.5rem)
const SAFETY_PX = 8; // guard against sub-pixel rounding so we never wrap

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
  const measureRef = useRef<HTMLDivElement>(null);
  // Start by assuming all fit; the clip container keeps the SSR output from
  // bleeding until the measure pass trims it.
  const [visible, setVisible] = useState(sections.length);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;

    const recompute = () => {
      const avail = nav.clientWidth;
      const widths = Array.from(
        measure.querySelectorAll<HTMLElement>("[data-item]"),
      ).map((el) => el.getBoundingClientRect().width);
      const moreEl = measure.querySelector<HTMLElement>("[data-more]");
      const moreW = moreEl ? moreEl.getBoundingClientRect().width : 72;

      // Safety net: if measurement failed (any zero width) or the bar hasn't
      // been laid out yet, fall back to a conservative inline count + More
      // rather than ever rendering an untrimmed, clipped row with no menu.
      if (avail <= 0 || widths.length === 0 || widths.some((w) => w <= 0)) {
        setVisible(Math.min(sections.length, 4));
        return;
      }

      // Does the whole set fit with no menu?
      let total = 0;
      for (let i = 0; i < widths.length; i++) {
        total += widths[i] + (i > 0 ? GAP_PX : 0);
      }
      if (total <= avail) {
        setVisible(widths.length);
        return;
      }

      // Otherwise reserve space for "More" and fit as many as we can.
      const budget = avail - moreW - GAP_PX - SAFETY_PX;
      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = used + widths[i] + (count > 0 ? GAP_PX : 0);
        if (next > budget) break;
        used = next;
        count++;
      }
      setVisible(Math.max(1, count));
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [sections]);

  const inline = sections.slice(0, visible);
  const overflow = sections.slice(visible);

  return (
    <nav
      ref={navRef}
      aria-label="Sections"
      className={`relative flex min-w-0 items-center gap-x-6 ${className}`}
    >
      {/* The visible one-line row. Clipped so it can never wrap or bleed. */}
      <div
        className={`flex min-w-0 flex-1 flex-nowrap items-center gap-x-6 overflow-hidden ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {inline.map((s) => (
          <Link
            key={s}
            href={sectionHref(s)}
            className="kicker kicker-muted ul-link shrink-0 whitespace-nowrap py-0.5 hover:text-primary"
          >
            {s}
          </Link>
        ))}
      </div>

      {overflow.length > 0 && (
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
            {overflow.map((s) => (
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

      {/* Off-layout measurement row: every label + the More control at natural
          width. INLINE-BLOCK (not flex) so items keep their intrinsic width;
          flex children shrink to ~0 inside the w-0 box and measure wrong. The
          w-0/h-0 + overflow-hidden keeps it from affecting page width. */}
      <div
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 h-0 w-0 overflow-hidden whitespace-nowrap"
      >
        {sections.map((s) => (
          <span
            key={s}
            data-item
            className="kicker kicker-muted inline-block whitespace-nowrap py-0.5"
          >
            {s}
          </span>
        ))}
        <span
          data-more
          className="kicker kicker-muted inline-block whitespace-nowrap py-0.5"
        >
          More ▾
        </span>
      </div>
    </nav>
  );
}
