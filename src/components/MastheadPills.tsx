"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/Link";

/**
 * The Verge-style centered pill toggle in the flux/relay masthead. The active
 * pill (green outline + tint) tracks the current route: Top Stories on the home
 * page, Latest on /latest, Following on /following. Client component so it can
 * read `usePathname`; every pill reserves the 2px border so the highlight moves
 * without shifting the others.
 */
const PILLS = [
  { label: "Top Stories", href: "/" },
  { label: "Latest", href: "/latest" },
  { label: "Following", href: "/following" },
];

export function MastheadPills() {
  const pathname = usePathname() || "/";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="container-wide flex justify-center px-6 py-4">
      <div className="inline-flex items-center rounded-full bg-surfaceAlt p-1 font-display text-[0.7rem] font-bold uppercase tracking-[0.12em]">
        {PILLS.map((p) => {
          const active = isActive(p.href);
          return (
            <Link
              key={p.href}
              href={p.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border-2 px-5 py-2 transition-colors ${
                active
                  ? "border-primary text-heading"
                  : "border-transparent text-muted hover:text-heading"
              }`}
              style={
                active
                  ? { backgroundColor: "color-mix(in srgb, var(--primary) 15%, transparent)" }
                  : undefined
              }
            >
              {p.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
