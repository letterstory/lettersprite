import { sanitizePostHtml } from "@/lib/sanitize";

/**
 * Renders sanitized article HTML with the shared `.prose` typography. Pass
 * `dropCap` to enable an editorial drop cap on the first paragraph.
 */
export function PostContent({
  html,
  dropCap = false,
}: {
  html: string;
  dropCap?: boolean;
}) {
  const clean = sanitizePostHtml(html);
  return (
    <div
      className={`prose ${dropCap ? "prose-dropcap" : ""}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
