"use client";

import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { SiteSearch, type SearchItem } from "./SiteSearch";

/**
 * The minimized masthead for the editorial ("Atlantic") header: a compact
 * sticky bar that slides in from the top once the reader scrolls past the big
 * flag, so the oversized wordmark only shows at the very top and a small
 * persistent header takes over on scroll. The wordmark uses the theme's
 * `font-display` (serif) to match the flag.
 */
export function StickyMasthead({
  title,
  searchIndex,
  trending,
}: {
  title: string;
  searchIndex: SearchItem[];
  trending?: SearchItem[];
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 150);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`no-print fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container-wide flex items-center gap-4 px-6 py-2.5">
        <Link href="/" className="font-display text-2xl leading-none text-primary">
          {title}
        </Link>
        <div className="ml-auto flex items-center gap-2.5">
          <SiteSearch
            index={searchIndex}
            trending={trending}
            className="hidden w-44 lg:block"
          />
        </div>
      </div>
    </div>
  );
}
