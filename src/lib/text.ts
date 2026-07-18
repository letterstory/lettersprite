/**
 * Collapse a stray space that upstream content generation sometimes leaves
 * *before* sentence punctuation — e.g. "Dreamforce 2025 ," → "Dreamforce 2025,"
 * or "the registry ." → "the registry." — which reads as broken typesetting.
 *
 * Deliberately conservative: only ASCII spaces/tabs, and only when they sit
 * directly before `, . ; : ! ?`. Normal prose (and the Unicode ellipsis we add
 * to excerpts) is left untouched.
 */
export function tightenPunctuationSpacing(text: string): string {
  return text.replace(/[ \t]+([,.;:!?])/g, "$1");
}
