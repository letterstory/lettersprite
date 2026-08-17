import Link from "@/components/Link";
import { sectionHref } from "@/lib/editorial";

/**
 * The masthead section bar — a single horizontal row of section links.
 *
 * A phantom can own 6-9 pillars of wildly varying label width, so on narrow
 * screens they won't all fit. Rather than fold the overflow into a "More"
 * dropdown (which stranded the extra sections on phones — you couldn't reach
 * them), the row is now horizontally **swipeable**: `swipe-x` turns on touch /
 * trackpad horizontal scrolling with the scrollbar hidden. On wide screens the
 * row simply fits and doesn't scroll, so desktop is unchanged in the common
 * case; when it does overflow it scrolls instead of clipping.
 *
 * `flex-nowrap` keeps it to one line; `shrink-0` keeps each link its intrinsic
 * width so labels never wrap or truncate.
 */
export function SectionNav({
  sections,
  className = "",
  align = "start",
}: {
  sections: string[];
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <nav
      aria-label="Sections"
      className={`swipe-x flex min-w-0 flex-nowrap items-center gap-x-6 ${
        // Centre on wide screens where it fits; stay start-aligned when it
        // overflows so the first sections are never scrolled out of reach.
        align === "center" ? "md:justify-center" : ""
      } ${className}`}
    >
      {sections.map((s) => (
        <Link
          key={s}
          href={sectionHref(s)}
          className="kicker kicker-muted ul-link shrink-0 whitespace-nowrap py-0.5 hover:text-primary"
        >
          {s}
        </Link>
      ))}
    </nav>
  );
}
