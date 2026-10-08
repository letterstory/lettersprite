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

export function useTopic(): string | null {
  return useSyncExternalStore(subscribe, readTopic, () => null);
}

export function setTopic(topic: string | null) {
  const url = new URL(window.location.href);
  if (topic) url.searchParams.set("topic", topic);
  else url.searchParams.delete("topic");
  window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Topic chips over a pre-rendered grid. The filtering itself is TopicScope's,
 * page-wide; these chips only set the topic.
 */
export function TopicFilter({ topics, children }: { topics: string[]; children: ReactNode }) {
  const topic = useTopic();
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
      {children}
    </div>
  );
}

/**
 * Page-wide topic filter for every layout: any element carrying `data-topic`
 * hides unless it matches, and a bar says what is showing. Every story stays in
 * the static HTML; filtering only toggles visibility.
 */
export function TopicScope() {
  const topic = useTopic();
  if (!topic) return null;
  return (
    <>
      <style>{`.studio [data-topic]:not([data-topic="${CSS.escape(topic)}"]){display:none!important}`}</style>
      <div className="s-topicbar" role="status">
        <div className="s-wrap s-topicbar-row">
          <span>
            Showing <strong>{topic}</strong>
          </span>
          <button type="button" className="s-chip" onClick={() => setTopic(null)}>
            Clear ✕
          </button>
        </div>
      </div>
    </>
  );
}
