import { describe, expect, it } from "vitest";
import { sizedCover } from "./cover-url";

const OBJECT =
  "https://ref.supabase.co/storage/v1/object/public/canvas-images/org/canvas/gen/abc.png";

describe("sizedCover", () => {
  it("rewrites a Supabase Storage object URL to the render endpoint with width + quality", () => {
    expect(sizedCover(OBJECT, 800)).toBe(
      "https://ref.supabase.co/storage/v1/render/image/public/canvas-images/org/canvas/gen/abc.png?width=800&quality=70",
    );
  });

  it("appends transform params with & when the URL already has a query string", () => {
    expect(sizedCover(`${OBJECT}?v=2`, 400)).toBe(
      "https://ref.supabase.co/storage/v1/render/image/public/canvas-images/org/canvas/gen/abc.png?v=2&width=400&quality=70",
    );
  });

  it("passes non-Supabase URLs through untouched (stock photos, external covers)", () => {
    const external = "https://picsum.photos/seed/x/1200/675";
    expect(sizedCover(external, 800)).toBe(external);
  });

  it("passes the local generated-cover fallback through untouched", () => {
    expect(sizedCover("/covers/dawn-rings-3.png", 800)).toBe(
      "/covers/dawn-rings-3.png",
    );
  });
});
