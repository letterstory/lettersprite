"use client";

import { usePathname } from "next/navigation";

export interface DemoPeer {
  label: string;
  /** Base URL of that site's demo, e.g. http://localhost:9001 */
  url: string;
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
  return (
    <div className="design-switch" role="group" aria-label="Demo">
      <div className="design-switch-group" role="group" aria-label="Design">
        {isNew ? <a href={other}>Current</a> : <span aria-current="true">Current</span>}
        {isNew ? <span aria-current="true">Redesign</span> : <a href={other}>Redesign</a>}
      </div>
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
