"use client";

import { useSyncExternalStore } from "react";

/**
 * Masthead dateline showing the reader's *current* date. Rendered client-side on
 * purpose: this is a fully static build, so any server-computed date would freeze
 * at build time. Empty on the server and during hydration (the server snapshot), then the
 * reader's date, so it
 * is always accurate for the viewer with no hydration mismatch.
 */
const noSubscribe = () => () => {};
const today = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export function EditionDate({ className = "" }: { className?: string }) {
  const date = useSyncExternalStore(noSubscribe, today, () => "");

  return (
    <span className={className} suppressHydrationWarning>
      {date}
    </span>
  );
}
