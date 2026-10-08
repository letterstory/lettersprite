"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/toc";

/** Sticky outline that tracks the section in view. */
export function TocSpy({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

  // The active section is the last heading that has scrolled past the top
  // band of the viewport; before the first one, nothing is active.
  useEffect(() => {
    const els = headings
      .filter((h) => h.level === 2)
      .map((h) => document.getElementById(h.id))
      .filter((e): e is HTMLElement => e !== null);
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.25) current = el.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  return (
    <nav className="s-toc" aria-label="In this article">
      <p className="s-toc-label">In this article</p>
      <ol>
        {headings
          .filter((h) => h.level === 2)
          .map((h) => (
            <li key={h.id} className={h.id === active ? "is-active" : undefined}>
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          ))}
      </ol>
    </nav>
  );
}
