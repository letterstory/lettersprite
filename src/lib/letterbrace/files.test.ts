import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockEnv = vi.hoisted(() => ({
  env: {
    letterbraceApiUrl: "https://api.test/integrations",
    letterbraceApiKey: "lb_testkey",
    collectionId: "",
    contentDir: "content/posts",
    postsLimit: 500,
    showDrafts: false,
  },
  hasLetterbraceKey: true,
}));
vi.mock("@/env", () => mockEnv);

import { getPostBySlug, getPosts } from "./client";
import { normalizePost } from "./normalize";
import { parsePostFile, rawFromPostFile, readBodyStyle } from "./files";

/** A post file as Letter writes one (docs/architecture/phantom-code.md in Letter). */
const LETTER_FILE = `---
title: "Small models, big wins: what changed in 2026"
slug: small-models-big-wins
article_id: 4f1c2a9e-0000-4000-8000-000000000001
collection_id: 9a9a9a9a-0000-4000-8000-000000000002
published_at: 2026-10-01T09:30:00.000Z
updated_at: 2026-10-02T11:00:00.000Z
summary: Why the cheapest model is often the right one.
author: Dana Whitfield
author_slug: dana-whitfield
author_profile:
  name: Dana Whitfield
  slug: dana-whitfield
  bio: Writes about applied ML.
  role: Senior Editor
  expertise:
    - inference
  started_at: 2025-03-01
cover_image: https://example.supabase.co/storage/v1/object/public/covers/a.png
cover_image_alt: A small robot lifting a large weight
tags:
  - Machine Learning
  - Costs
paper_trail:
  sources:
    - url: https://example.com/report
      title: The 2026 inference report
      note: Cost per token by model size.
---

## Why size stopped mattering

Most teams **overpay** for inference. See [the report](https://example.com/report).

- Cheaper
- Faster

![Chart of costs](https://example.com/chart.png)
`;

/** The same article as `/published` serves it, body as the HTML Letter keeps. */
const API_ITEM = {
  title: "Small models, big wins: what changed in 2026",
  slug: "small-models-big-wins",
  article_id: "4f1c2a9e-0000-4000-8000-000000000001",
  collection_id: "9a9a9a9a-0000-4000-8000-000000000002",
  published_at: "2026-10-01T09:30:00.000Z",
  updated_at: "2026-10-02T11:00:00.000Z",
  summary: "Why the cheapest model is often the right one.",
  author: "Dana Whitfield",
  author_slug: "dana-whitfield",
  author_profile: {
    name: "Dana Whitfield",
    slug: "dana-whitfield",
    bio: "Writes about applied ML.",
    role: "Senior Editor",
    expertise: ["inference"],
    started_at: "2025-03-01",
  },
  cover_image: "https://example.supabase.co/storage/v1/object/public/covers/a.png",
  cover_image_alt: "A small robot lifting a large weight",
  tags: ["Machine Learning", "Costs"],
  paper_trail: {
    sources: [
      { url: "https://example.com/report", title: "The 2026 inference report", note: "Cost per token by model size." },
    ],
  },
  content:
    '<h2>Why size stopped mattering</h2><p>Most teams <strong>overpay</strong> for inference. See <a href="https://example.com/report">the report</a>.</p><ul><li>Cheaper</li><li>Faster</li></ul><p><img src="https://example.com/chart.png" alt="Chart of costs"></p>',
};

describe("a post file", () => {
  it("reads as the same post the API item does", () => {
    const fromFile = normalizePost(rawFromPostFile(LETTER_FILE, "small-models-big-wins.md"));
    const fromApi = normalizePost(API_ITEM);
    expect(fromFile).toEqual(fromApi);
  });

  it("renders its body as GitHub-flavored Markdown in the site's style", () => {
    const style = {
      tags: { a: { class: "text-primary underline" } },
      externalLinks: { target: "_blank" },
    };
    const raw = rawFromPostFile(
      "---\ntitle: T\n---\n\nH<sub>2</sub>O and [a link](https://x.test/a).\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n",
      "t.md",
      style,
    );
    expect(raw.content).toBe(
      '<p>H<sub>2</sub>O and <a class="text-primary underline" target="_blank" href="https://x.test/a">a link</a>.</p><table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>',
    );
  });

  it("serves a body Letter kept as HTML exactly as written", () => {
    const html = "<p></p><p>Spaced <em>out</em></p>";
    const raw = rawFromPostFile(`---\ntitle: T\nformat: html\n---\n${html}`, "t.md", {
      tags: { p: { class: "never" } },
    });
    expect(raw.content).toBe(html);
  });

  it("needs only a title: the slug and the id come from the file name", () => {
    const post = normalizePost(rawFromPostFile("---\ntitle: Hello there\n---\n\nHi.\n", "hello-there.md"));
    expect(post).toMatchObject({ id: "file:hello-there", slug: "hello-there", title: "Hello there" });
    expect(post?.content).toBe("<p>Hi.</p>");
  });

  it("reads the site's body style beside the posts directory, or none", () => {
    const root = mkdtempSync(join(tmpdir(), "style-"));
    mkdirSync(join(root, "content/posts"), { recursive: true });
    expect(readBodyStyle(join(root, "content/posts"))).toEqual({ tags: {} });
    writeFileSync(join(root, "content/posts.json"), JSON.stringify({ body: { tags: { a: { class: "x" } } } }));
    expect(readBodyStyle(join(root, "content/posts"))).toEqual({ tags: { a: { class: "x" } } });
    rmSync(root, { recursive: true, force: true });
  });

  it("reads a file without frontmatter as all body", () => {
    expect(parsePostFile("# Just text\n")).toEqual({ data: {}, body: "# Just text\n" });
  });
});

describe("a site that keeps its posts as files", () => {
  let root: string;
  const cwd = process.cwd();

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "posts-"));
    mkdirSync(join(root, "content/posts"), { recursive: true });
    process.chdir(root);
  });
  afterEach(() => {
    process.chdir(cwd);
    rmSync(root, { recursive: true, force: true });
    vi.unstubAllGlobals();
  });

  it("serves its files, newest first, and never calls the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    writeFileSync(join(root, "content/posts/small-models-big-wins.md"), LETTER_FILE);
    writeFileSync(
      join(root, "content/posts/newer.md"),
      "---\ntitle: Newer\npublished_at: 2026-11-01T00:00:00Z\n---\n\nNew.\n",
    );
    writeFileSync(
      join(root, "content/posts/held.md"),
      "---\ntitle: Held\nstatus: draft\npublished_at: 2026-11-02T00:00:00Z\n---\n\nNot yet.\n",
    );
    writeFileSync(join(root, "content/posts/README.md"), "Posts live here.\n");

    const posts = await getPosts();
    expect(posts.map((p) => p.slug)).toEqual(["newer", "small-models-big-wins"]);
    expect(await getPostBySlug("small-models-big-wins")).toMatchObject({ title: API_ITEM.title });
    expect(await getPostBySlug("missing")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
