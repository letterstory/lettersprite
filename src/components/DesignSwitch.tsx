"use client";

import { usePathname } from "next/navigation";

/** Map a route to its counterpart in the other design. */
function counterpart(path: string): { href: string; isNew: boolean } {
  if (path === "/new" || path.startsWith("/new/")) {
    const rest = path.slice(4) || "/";
    return { href: rest, isNew: true };
  }
  if (path.startsWith("/posts/")) return { href: `/new${path}`, isNew: false };
  return { href: "/new", isNew: false };
}

/**
 * A floating Current ⇄ Redesign switch for showing the two designs side by
 * side on one site. Rendered only when `SITE_DESIGN_COMPARE` is on.
 */
export function DesignSwitch() {
  const path = usePathname() ?? "/";
  const { href, isNew } = counterpart(path);
  return (
    <div className="design-switch" role="group" aria-label="Design">
      {isNew ? <a href={href}>Current</a> : <span aria-current="true">Current</span>}
      {isNew ? <span aria-current="true">Redesign</span> : <a href={href}>Redesign</a>}
    </div>
  );
}

/** Hide the classic header/footer on redesign routes, which bring their own. */
export function ClassicChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  if (path === "/new" || path.startsWith("/new/")) return null;
  return <>{children}</>;
}
