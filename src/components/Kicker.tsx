import Link from "next/link";
import type { Post } from "@/lib/letterbrace/types";
import { sectionFor, sectionHref } from "@/lib/editorial";

/**
 * The all-caps section eyebrow ("kicker") above a headline — one of the most
 * recognizable signals of an editorial front. Colored by the theme's `--kicker`
 * and linked to the section's index page, like a real masthead label.
 */
export function Kicker({
  post,
  className = "",
  variant = "primary",
  linked = true,
}: {
  post: Post;
  className?: string;
  variant?: "primary" | "accent" | "muted";
  linked?: boolean;
}) {
  const label = sectionFor(post);
  const tone =
    variant === "accent"
      ? "kicker-accent"
      : variant === "muted"
        ? "kicker-muted"
        : "";
  const cls = `kicker ${tone} ${className}`.trim();
  if (!linked) return <span className={cls}>{label}</span>;
  return (
    <Link href={sectionHref(label)} className={`${cls} ul-link w-fit`}>
      {label}
    </Link>
  );
}
