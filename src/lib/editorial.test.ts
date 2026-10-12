import { describe, expect, it } from "vitest";
import {
  editionDate,
  isUpdated,
  latestDate,
  modifiedDate,
  orderedByDate,
  publishDate,
} from "./editorial";
import type { Post } from "./letterbrace/types";

const post = (id: string, createdAt: string | null, updatedAt: string | null = null): Post => ({
  id,
  slug: `post-${id}`,
  title: `Post ${id}`,
  content: "<p>x</p>",
  excerpt: "x",
  dek: null,
  status: "published",
  author: null,
  authorSlug: null,
  authorProfile: null,
  coverImage: null,
  coverImageAlt: null,
  coverCredit: null,
  tags: [],
  createdAt,
  updatedAt,
  paperTrail: [],
  sponsorDisclosure: null,
});

// A made-up dateline claims a back catalogue the site does not have.
describe("dates are never invented", () => {
  it("gives an undated post no publish or modified date", () => {
    const undated = post("1", null, "2026-09-01T00:00:00.000Z");
    expect(publishDate(undated)).toBeNull();
    expect(modifiedDate(undated)).toBeNull();
    expect(isUpdated(undated)).toBe(false);
  });

  it("keeps a real date exactly as served", () => {
    const dated = post("1", "2026-08-01T00:00:00.000Z", "2026-09-01T00:00:00.000Z");
    expect(publishDate(dated)).toBe("2026-08-01T00:00:00.000Z");
    expect(modifiedDate(dated)).toBe("2026-09-01T00:00:00.000Z");
    expect(isUpdated(dated)).toBe(true);
  });

  it("orders undated posts after dated ones, in the order given", () => {
    const posts = [post("a", null), post("b", "2026-01-01T00:00:00.000Z"), post("c", null), post("d", "2026-02-01T00:00:00.000Z")];
    expect(orderedByDate(posts).map((p) => p.id)).toEqual(["d", "b", "a", "c"]);
  });

  it("has no edition date when nothing is dated", () => {
    expect(editionDate([post("a", null)])).toBeNull();
    expect(latestDate([])).toBeNull();
    expect(editionDate([post("a", null), post("b", "2026-02-01T00:00:00.000Z")])).toBe("2026-02-01T00:00:00.000Z");
  });
});
