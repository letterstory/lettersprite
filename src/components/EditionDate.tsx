"use client";

import { useEffect, useState } from "react";

/**
 * Masthead dateline showing the reader's *current* date. Rendered client-side on
 * purpose: this is a fully static build, so any server-computed date would freeze
 * at build time. Empty on the server / first paint, then filled on mount, so it
 * is always accurate for the viewer with no hydration mismatch.
 */
export function EditionDate({ className = "" }: { className?: string }) {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    );
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {date}
    </span>
  );
}
