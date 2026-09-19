import type { Post } from "@/lib/letterbrace/types";

/**
 * Curated finance/business photography (Unsplash), pooled by beat. Used by the
 * `bourse` theme (Venture Capital Letters) so every cover — on the home grid,
 * article pages, and section/topic pages — is a real photo instead of an AI
 * illustration. Gated by the `stockCovers` theme feature, so no other site is
 * affected.
 */

const PHOTOS: Record<string, string[]> = {
  "AI in Venture Capital": ["1460925895917-afdab827c52f", "1519389950473-47ba0277781c", "1590283603385-17ffb3a7f29f", "1553877522-43269d4ea984", "1454165804606-c3d57bc86b40", "1573164713988-8665fc963095", "1559526324-4b87b5e36e44"],
  "Fund Management": ["1554224155-6726b3ff858f", "1486406146926-c627a92ad1ab", "1542744173-8e7e53415bb0", "1521737604893-d14cc237f11d", "1497215728101-856f4ea42174", "1526304640581-d334cdbbf45e", "1556761175-b413da4baf72"],
  "Investor Relations": ["1517245386807-bb43f82c33c4", "1552664730-d307ca884978", "1600880292203-757bb62b4baf", "1507003211169-0a1dd7228f2d", "1444653614773-995cb1ef9efa", "1507679799987-c73779587ccf", "1556761175-b413da4baf72"],
  "Venture Funding Landscape": ["1579532537598-459ecdaf39cc", "1526304640581-d334cdbbf45e", "1590283603385-17ffb3a7f29f", "1486406146926-c627a92ad1ab"],
  "Venture Capital Fundamentals": ["1541354329998-f4d9a9f9297f", "1554774853-aae0a22c8aa4", "1454165804606-c3d57bc86b40", "1444653614773-995cb1ef9efa"],
  "Startup Fundraising": ["1552664730-d307ca884978", "1600880292203-757bb62b4baf", "1556761175-b413da4baf72", "1553877522-43269d4ea984"],
  // HammerFin (folio theme) — finance-ops beats.
  "Expense management": ["1554224155-6726b3ff858f", "1526304640581-d334cdbbf45e", "1553877522-43269d4ea984", "1497215728101-856f4ea42174", "1559526324-4b87b5e36e44"],
  "Accounts payable": ["1554224155-6726b3ff858f", "1526304640581-d334cdbbf45e", "1454165804606-c3d57bc86b40", "1559526324-4b87b5e36e44", "1497215728101-856f4ea42174"],
  "Accounting": ["1454165804606-c3d57bc86b40", "1554224155-6726b3ff858f", "1497215728101-856f4ea42174", "1541354329998-f4d9a9f9297f", "1553877522-43269d4ea984"],
  "Financial planning": ["1590283603385-17ffb3a7f29f", "1460925895917-afdab827c52f", "1521737604893-d14cc237f11d", "1454165804606-c3d57bc86b40"],
  "Finance teams": ["1556761175-b413da4baf72", "1521737604893-d14cc237f11d", "1552664730-d307ca884978", "1542744173-8e7e53415bb0", "1553877522-43269d4ea984"],
  // Video Content for Startups (blitz theme) — tech / workspace / people shots
  // (finance-specific frames from the shared pool are deliberately excluded).
  "Startup Video Strategy": ["1517245386807-bb43f82c33c4", "1552664730-d307ca884978", "1600880292203-757bb62b4baf", "1507003211169-0a1dd7228f2d", "1454165804606-c3d57bc86b40", "1519389950473-47ba0277781c", "1521737604893-d14cc237f11d"],
  "Technical Content Videos": ["1454165804606-c3d57bc86b40", "1573164713988-8665fc963095", "1559526324-4b87b5e36e44", "1519389950473-47ba0277781c", "1497215728101-856f4ea42174", "1460925895917-afdab827c52f", "1507679799987-c73779587ccf"],
  "Features": ["1553877522-43269d4ea984", "1486406146926-c627a92ad1ab", "1542744173-8e7e53415bb0", "1556761175-b413da4baf72", "1554774853-aae0a22c8aa4", "1517245386807-bb43f82c33c4", "1573164713988-8665fc963095"],
};
const FALLBACK = ["1454165804606-c3d57bc86b40", "1460925895917-afdab827c52f", "1486406146926-c627a92ad1ab", "1553877522-43269d4ea984"];

const url = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=70`;

const poolFor = (section: string): string[] => PHOTOS[section] ?? FALLBACK;
const sectionOf = (post: Post): string => post.tags?.[0] ?? "";

/** Deterministic FNV-1a hash — stable across builds. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Assign each post a distinct photo, round-robin within its beat — so a grid of
 * posts never repeats an image. Used by the home layout, which has the full list.
 */
export function makeCovers(posts: Post[], width = 1200): Map<string, string> {
  const counters: Record<string, number> = {};
  const map = new Map<string, string>();
  for (const p of posts) {
    const sec = sectionOf(p);
    const pool = poolFor(sec);
    const n = counters[sec] ?? 0;
    counters[sec] = n + 1;
    map.set(p.slug, url(pool[n % pool.length], width));
  }
  return map;
}

/**
 * A stable per-post stock photo, for standalone cover uses (article hero,
 * section-page cards) where the full list isn't threaded through. Same post
 * always resolves to the same photo.
 */
export function stockCoverFor(post: Post, width = 1200): string {
  const pool = poolFor(sectionOf(post));
  return url(pool[hash(post.slug) % pool.length], width);
}
