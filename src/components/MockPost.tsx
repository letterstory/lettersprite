/**
 * Formerly: mock social posts by invented people, with invented engagement counts,
 * styled as embeds. Retired 2026-10-12: invented people vouching for the site's
 * subject at an invented scale is the "fake personas … how widely a view is held"
 * pattern Anthropic's Usage Policy names (Letter's
 * docs/architecture/phantom-aup-audit-2026-10-12.md, item 4). Renders nothing; the
 * props stay so call sites keep compiling.
 */
type Variant = "twitter" | "instagram";

export function MockPost(props: {
  variant?: Variant;
  seed?: number;
  image?: string;
  className?: string;
}) {
  void props;
  return null;
}
