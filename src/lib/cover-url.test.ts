import { describe, expect, it } from "vitest";
import { sizedCover } from "./cover-url";

const OBJECT =
  "https://ref.supabase.co/storage/v1/object/public/canvas-images/org/canvas/gen/abc.png";

describe("sizedCover", () => {
  // resize=contain is the whole point: width alone makes Supabase return
  // (width × SOURCE height), i.e. a horizontal crop, not a proportional scale.
  it("rewrites a Supabase Storage object URL to the render endpoint, preserving aspect", () => {
    expect(sizedCover(OBJECT, 800)).toBe(
      "https://ref.supabase.co/storage/v1/render/image/public/canvas-images/org/canvas/gen/abc.png?width=800&resize=contain&quality=70",
    );
  });

  it("appends transform params with & when the URL already has a query string", () => {
    expect(sizedCover(`${OBJECT}?v=2`, 400)).toBe(
      "https://ref.supabase.co/storage/v1/render/image/public/canvas-images/org/canvas/gen/abc.png?v=2&width=400&resize=contain&quality=70",
    );
  });

  it("passes non-Supabase URLs through untouched (stock photos, external covers)", () => {
    const external = "https://picsum.photos/seed/x/1200/675";
    expect(sizedCover(external, 800)).toBe(external);
  });

  it("always asks for a proportional resize, at every width", () => {
    for (const w of [400, 800, 1000, 1200, 1600]) {
      expect(sizedCover(OBJECT, w)).toContain("resize=contain");
    }
  });

  it("passes the local generated-cover fallback through untouched", () => {
    expect(sizedCover("/covers/dawn-rings-3.png", 800)).toBe(
      "/covers/dawn-rings-3.png",
    );
  });
});
