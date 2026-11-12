import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EditionDate } from "@/components/EditionDate";
import { ModeToggle } from "@/components/ModeToggle";

// Both read the browser (the reader's date, the boot script's `data-mode`).
// The static HTML is their server snapshot, which hydration must match.
describe("client-only snapshots in static HTML", () => {
  it("renders the edition date empty", () => {
    expect(renderToString(<EditionDate className="d" />)).toBe('<span class="d"></span>');
  });

  it("renders the mode toggle in dark", () => {
    expect(renderToString(<ModeToggle />)).toContain('aria-label="Switch to light mode"');
  });
});
