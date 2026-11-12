import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { parseFollowing, useFollowing } from "@/lib/follow";

describe("parseFollowing", () => {
  it("keeps valid section and author entries", () => {
    const raw = JSON.stringify([
      { kind: "section", slug: "ai", name: "AI" },
      { kind: "author", slug: "jo", name: "Jo" },
    ]);
    expect(parseFollowing(raw)).toEqual([
      { kind: "section", slug: "ai", name: "AI" },
      { kind: "author", slug: "jo", name: "Jo" },
    ]);
  });

  it("drops malformed entries", () => {
    const raw = JSON.stringify([
      { kind: "tag", slug: "x", name: "X" },
      { kind: "section", slug: 1, name: "One" },
      null,
      { kind: "section", slug: "ok", name: "Ok" },
    ]);
    expect(parseFollowing(raw)).toEqual([{ kind: "section", slug: "ok", name: "Ok" }]);
  });

  it("reads nothing, garbage or a non-array as no follows", () => {
    expect(parseFollowing(null)).toEqual([]);
    expect(parseFollowing("not json")).toEqual([]);
    expect(parseFollowing('{"kind":"section"}')).toEqual([]);
  });
});

// The static HTML must be the "not mounted" state, so a returning reader's
// follows never flash as "not following anything" before hydration.
describe("useFollowing on the server", () => {
  function Probe() {
    const [list, mounted] = useFollowing();
    return <p>{`${mounted}:${list.length}`}</p>;
  }

  it("renders unmounted with an empty list", () => {
    expect(renderToString(<Probe />)).toBe("<p>false:0</p>");
  });
});
