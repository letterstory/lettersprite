"use client";

import { useState, type ReactNode } from "react";

/**
 * Latest / Popular toggle for the blitz front river. Both lists are rendered on
 * the server (so covers and datelines resolve at build time) and passed in as
 * nodes; this island only flips which one is shown.
 */
export function BlitzTabs({
  latest,
  popular,
}: {
  latest: ReactNode;
  popular: ReactNode;
}) {
  const [tab, setTab] = useState<"latest" | "popular">("latest");
  const tabCls = (active: boolean) =>
    `flex-1 border-b-2 py-3.5 text-center text-sm font-bold tracking-[0.01em] transition-colors ${
      active
        ? "border-heading text-heading"
        : "border-transparent text-muted hover:text-heading"
    }`;

  return (
    <div>
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("latest")}
          aria-pressed={tab === "latest"}
          className={tabCls(tab === "latest")}
        >
          Latest
        </button>
        <button
          type="button"
          onClick={() => setTab("popular")}
          aria-pressed={tab === "popular"}
          className={tabCls(tab === "popular")}
        >
          Popular
        </button>
      </div>
      <div className={tab === "latest" ? "" : "hidden"}>{latest}</div>
      <div className={tab === "popular" ? "" : "hidden"}>{popular}</div>
    </div>
  );
}
