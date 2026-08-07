import { describe, it, expect } from "vitest";
import { normalizePost } from "./normalize";

/**
 * Guards the "configurable collection fields" payload mapping: a non-Classic
 * collection type's `collection_type` + `custom_fields` must flow into the Post,
 * and a Classic post (which ships neither) must map to the inert defaults so its
 * rendering stays unchanged.
 */
describe("normalizePost — collection type + custom fields", () => {
  const base = {
    article_id: "art-1",
    title: "A Post",
    content: "<p>Body</p>",
    slug: "a-post",
  };

  it("maps collection_type and the labelled custom_fields array for a non-Classic post", () => {
    const post = normalizePost({
      ...base,
      collection_type: "landing",
      custom_fields: [
        { key: "industry", label: "Industry", value: " Fintech ", type: null }, // trimmed
        { key: "demo", label: "Book a demo", value: "https://example.com/go", type: "cta" },
        { key: "blank", label: "Blank", value: "   ", type: null }, // dropped (no value)
        { key: "", label: "No key", value: "x", type: null }, // dropped (no key)
      ],
    });
    expect(post?.collectionType).toBe("landing");
    // Order preserved; labels carried verbatim; empty/keyless entries dropped.
    expect(post?.customFields).toEqual([
      { key: "industry", label: "Industry", value: "Fintech", type: null },
      { key: "demo", label: "Book a demo", value: "https://example.com/go", type: "cta" },
    ]);
  });

  it("falls back label to key when the sender omits a label", () => {
    const post = normalizePost({
      ...base,
      custom_fields: [{ key: "arr", value: "$40M" }],
    });
    expect(post?.customFields).toEqual([{ key: "arr", label: "arr", value: "$40M", type: null }]);
  });

  it("defaults to Classic (null type, empty fields) when the payload omits them", () => {
    const post = normalizePost(base);
    expect(post?.collectionType).toBeNull();
    expect(post?.customFields).toEqual([]);
  });

  it("tolerates a malformed custom_fields blob", () => {
    expect(normalizePost({ ...base, custom_fields: "nope" })?.customFields).toEqual([]);
    expect(normalizePost({ ...base, custom_fields: { a: 1 } })?.customFields).toEqual([]);
    expect(normalizePost({ ...base, custom_fields: ["a", "b"] })?.customFields).toEqual([]);
  });
});
