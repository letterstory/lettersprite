"use client";

import { useState, type ReactNode } from "react";

/**
 * Topic chips over a pre-rendered grid. Every card is server-rendered with its
 * topic in `data-topic`; filtering only toggles visibility, so the page stays
 * fully static and every story is in the HTML for crawlers.
 */
export function TopicFilter({ topics, children }: { topics: string[]; children: ReactNode }) {
  const [topic, setTopic] = useState<string | null>(null);
  return (
    <div className="s-filter" data-topic-active={topic ?? ""}>
      <div className="s-chips" role="toolbar" aria-label="Filter by topic">
        <button type="button" className="s-chip" aria-pressed={topic === null} onClick={() => setTopic(null)}>
          All
        </button>
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            className="s-chip"
            aria-pressed={topic === t}
            onClick={() => setTopic(topic === t ? null : t)}
          >
            {t}
          </button>
        ))}
      </div>
      <style>{topic ? `.s-filter [data-topic]:not([data-topic="${CSS.escape(topic)}"]){display:none}` : ""}</style>
      {children}
    </div>
  );
}
