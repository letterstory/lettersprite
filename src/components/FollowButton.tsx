"use client";

import { isFollowing, toggleFollow, useFollowing, type FollowKind } from "@/lib/follow";

/**
 * A Follow / Following toggle for a section or author. Theme-agnostic: it styles
 * from the palette CSS vars, so it matches every deployment. State is shared —
 * following something here updates the /following feed and every other button
 * for the same target instantly (see `useFollowing`).
 */
export function FollowButton({
  kind,
  slug,
  name,
  size = "md",
  className = "",
  label,
}: {
  kind: FollowKind;
  slug: string;
  name: string;
  size?: "sm" | "md";
  className?: string;
  /**
   * When set, the chip shows this text (e.g. the section/author name) instead of
   * the word "Follow"/"Following"; the follow state is conveyed by the filled
   * background + check icon. Use it where the target's name isn't already shown.
   */
  label?: string;
}) {
  const [list, mounted] = useFollowing();
  const following = mounted && isFollowing(list, kind, slug);
  const pad = size === "sm" ? "px-3 py-1 text-[0.6rem]" : "px-4 py-1.5 text-[0.68rem]";
  const text = label ?? (following ? "Following" : "Follow");

  return (
    <button
      type="button"
      onClick={() => toggleFollow({ kind, slug, name })}
      aria-pressed={following}
      aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-display font-bold uppercase tracking-[0.08em] transition-colors ${pad} ${
        following
          ? "border-primary bg-primary text-[color:var(--primary-fg)]"
          : "border-border text-heading hover:border-primary hover:text-primary"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {following ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 5v14M5 12h14" />}
      </svg>
      {text}
    </button>
  );
}
