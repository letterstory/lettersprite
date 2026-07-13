import { sanitizePostHtml } from "@/lib/sanitize";

/**
 * Renders sanitized article HTML with the shared `.prose` typography. Pass
 * `dropCap` to enable an editorial drop cap on the first paragraph.
 *
 * Pass `sanitized` when `html` has *already* been sanitized (e.g. the article
 * page sanitizes once, then injects heading anchors for the table of contents
 * via `buildToc`). Defaults to sanitizing here so the component stays safe by
 * default for any other caller.
 */
export function PostContent({
  html,
  dropCap = false,
  sanitized = false,
}: {
  html: string;
  dropCap?: boolean;
  sanitized?: boolean;
}) {
  const clean = sanitized ? html : sanitizePostHtml(html);
  return (
    <div
      className={`prose ${dropCap ? "prose-dropcap" : ""}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
