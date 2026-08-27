import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mutable env the client reads; each test tweaks postsLimit/collectionId.
const mockEnv = vi.hoisted(() => ({
  env: {
    letterbraceApiUrl: "https://api.test/integrations",
    letterbraceApiKey: "lb_testkey",
    collectionId: "",
    postsLimit: 50,
    showDrafts: false,
  },
  hasLetterbraceKey: true,
}));
vi.mock("@/env", () => mockEnv);

import { getPosts } from "./client";

/** A fake `/published` server: newest-first dataset, keyset-paged by an index cursor. */
function fakePublished(total: number, opts: { withCursor?: boolean } = {}) {
  const withCursor = opts.withCursor ?? true;
  const rows = Array.from({ length: total }, (_, i) => ({
    article_id: `a${i}`,
    title: `Post ${i}`,
    content: `<p>body ${i}</p>`,
    published_at: `2026-01-${String(total - i).padStart(2, "0")}T00:00:00Z`,
  }));
  const calls: string[] = [];
  const fetchMock = vi.fn(async (url: string) => {
    calls.push(url);
    const u = new URL(url);
    const limit = Number(u.searchParams.get("limit") ?? "1000");
    const start = Number(u.searchParams.get("cursor") ?? "0");
    const slice = rows.slice(start, start + limit);
    const next = start + limit;
    const hasMore = next < total;
    const body: Record<string, unknown> = { items: slice, count: slice.length };
    if (withCursor) {
      body.has_more = hasMore;
      body.next_cursor = hasMore ? String(next) : null;
    }
    return { ok: true, statusText: "OK", status: 200, json: async () => body };
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls, fetchMock };
}

beforeEach(() => {
  mockEnv.env.postsLimit = 50;
  mockEnv.env.collectionId = "";
  mockEnv.hasLetterbraceKey = true;
});
afterEach(() => vi.unstubAllGlobals());

describe("getPosts — bounded cursor pagination", () => {
  it("pages with a small limit and follows next_cursor until the feed ends", async () => {
    const { calls } = fakePublished(45); // 45 < postsLimit 50, so it drains the feed
    const posts = await getPosts();

    expect(posts).toHaveLength(45);
    expect(calls).toHaveLength(3); // 20 + 20 + 5
    // Every request is a small page; never an unbounded fetch.
    for (const c of calls) expect(new URL(c).searchParams.get("limit")).toBe("20");
    // The cursor chains: page 2 asks after row 20, page 3 after row 40.
    expect(new URL(calls[0]).searchParams.get("cursor")).toBeNull();
    expect(new URL(calls[1]).searchParams.get("cursor")).toBe("20");
    expect(new URL(calls[2]).searchParams.get("cursor")).toBe("40");
  });

  it("stops early once it has postsLimit posts, not fetching the whole org", async () => {
    mockEnv.env.postsLimit = 10;
    const { calls } = fakePublished(1000); // huge org
    const posts = await getPosts();

    expect(posts).toHaveLength(10);
    expect(calls).toHaveLength(1); // one page of 20 already covers a limit of 10
  });

  it("caps total pages so a misbehaving cursor can't loop forever", async () => {
    mockEnv.env.postsLimit = 100;
    // Server always claims there's more but the client must stop at maxPages.
    const { calls } = fakePublished(10_000);
    await getPosts();
    expect(calls.length).toBeLessThanOrEqual(Math.ceil(100 / 20) + 2);
  });

  it("falls back to a single page when the API omits the cursor envelope", async () => {
    const { calls } = fakePublished(200, { withCursor: false });
    const posts = await getPosts();
    expect(calls).toHaveLength(1);
    expect(posts).toHaveLength(20);
  });

  it("scopes to a collection when configured", async () => {
    mockEnv.env.collectionId = "col-123";
    const { calls } = fakePublished(5);
    await getPosts();
    expect(new URL(calls[0]).searchParams.get("collection_id")).toBe("col-123");
  });

  it("returns [] (empty state, not a throw) when the API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500, statusText: "Internal Server Error", json: async () => ({}) })),
    );
    expect(await getPosts()).toEqual([]);
  });
});
