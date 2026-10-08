"use client";

import { useSyncExternalStore, type ReactNode } from "react";

// The active topic lives in the URL (?topic=…), so header links can deep-link
// into a filtered grid and the chips stay in sync with back/forward.
const EVENT = "studio:topic";

function subscribe(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(EVENT, cb);
  };
}

const readTopic = () => new URLSearchParams(window.location.search).get("topic");

function setTopic(topic: string | null) {
  const url = new URL(window.location.href);
  if (topic) url.searchParams.set("topic", topic);
  else url.searchParams.delete("topic");
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Topic chips over a pre-rendered grid. Every card is server-rendered with its
 * topic in `data-topic`; filtering only toggles visibility, so the page stays
 * fully static and every story is in the HTML for crawlers.
 */
export function TopicFilter({ topics, children }: { topics: string[]; children: ReactNode }) {
  const topic = useSyncExternalStore(subscribe, readTopic, () => null);
  return (
    <div className="s-filter">
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
