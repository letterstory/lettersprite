/**
 * The redesign's layouts. Kept dependency-free so the proxy can read it.
 * Each is a way to set the same content; which one a site uses is an input
 * (SITE_LAYOUT), and on demo builds a reader may try the others (STYLE_COOKIE).
 */
export const LAYOUTS = ["notes", "journal", "magazine", "essay", "broadsheet", "clinical"] as const;
export type StudioLayout = (typeof LAYOUTS)[number];

export const LAYOUT_LABELS: Record<StudioLayout, string> = {
  notes: "Product notes",
  journal: "Research journal",
  magazine: "Magazine",
  essay: "Essay",
  broadsheet: "Broadsheet",
  clinical: "Clinical",
};

/** Demo-only: the reader's chosen layout, honoured by the proxy. */
export const STYLE_COOKIE = "ls_style";

export function isLayout(v: unknown): v is StudioLayout {
  return typeof v === "string" && (LAYOUTS as readonly string[]).includes(v);
}
