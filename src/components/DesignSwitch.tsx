"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { LAYOUTS, LAYOUT_LABELS, STYLE_COOKIE } from "@/lib/layouts";

const readStyle = () => new RegExp(`(?:^|; )${STYLE_COOKIE}=([^;]*)`).exec(document.cookie)?.[1] ?? "";
const noSubscribe = () => () => {};

/** Pick a redesign layout for this browser (the proxy honours it), then show it. */
function chooseStyle(style: string, target: string) {
  document.cookie = style
    ? `${STYLE_COOKIE}=${style}; path=/; max-age=31536000; samesite=lax`
    : `${STYLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
  window.location.assign(target);
}

export interface DemoPeer {
  label: string;
  /** Base URL of that site's demo, e.g. http://localhost:9001 */
  url: string;
}

/** The current query string, client-side only (keeps ?topic= across a restyle). */
function window_search(): string {
  return typeof window === "undefined" ? "" : window.location.search;
}

function isNewPath(path: string): boolean {
  return path === "/new" || path.startsWith("/new/");
}

/** Map a route to its counterpart in the other design. */
function counterpart(path: string): string {
  if (isNewPath(path)) return path.slice(4) || "/";
  if (path.startsWith("/posts/")) return `/new${path}`;
  return "/new";
}

/**
 * A floating Current ⇄ Redesign switch for showing the two designs side by
 * side on one site, plus (when `SITE_DEMO_PEERS` is set) a button per demo site
 * that opens the other site in the same design. Rendered only when
 * `SITE_DESIGN_COMPARE` is on.
 */
export function DesignSwitch({ peers = [], self = "" }: { peers?: DemoPeer[]; self?: string }) {
  const path = usePathname() ?? "/";
  const isNew = isNewPath(path);
  const other = counterpart(path);
  const style = useSyncExternalStore(noSubscribe, readStyle, () => "");
  // Choosing a style always lands on the redesign of the page you're on.
  const redesignPath = isNew ? path + window_search() : other;
  return (
    <div className="design-switch" role="group" aria-label="Demo">
      <div className="design-switch-group" role="group" aria-label="Design">
        {isNew ? <a href={other}>Current</a> : <span aria-current="true">Current</span>}
        {isNew ? <span aria-current="true">Redesign</span> : <a href={other}>Redesign</a>}
      </div>
      <label className="design-switch-style">
        <span className="sr-only">Style</span>
        <select value={style} onChange={(e) => chooseStyle(e.target.value, redesignPath)} aria-label="Redesign style">
          <option value="">Style: site default</option>
          {LAYOUTS.map((l) => (
            <option key={l} value={l}>
              Style: {LAYOUT_LABELS[l]}
            </option>
          ))}
        </select>
      </label>
      {peers.length > 0 && (
        <div className="design-switch-group design-switch-sites" role="group" aria-label="Site">
          {peers.map((p) =>
            p.label === self ? (
              <span key={p.url} aria-current="true">
                {p.label}
              </span>
            ) : (
              <a key={p.url} href={`${p.url.replace(/\/$/, "")}${isNew ? "/new" : "/"}`}>
                {p.label}
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/** Hide the classic header/footer on redesign routes, which bring their own. */
export function ClassicChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  if (isNewPath(path)) return null;
  return <>{children}</>;
}
