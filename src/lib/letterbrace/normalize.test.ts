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

  it("maps collection_type and custom_fields for a non-Classic post", () => {
    const post = normalizePost({
      ...base,
      collection_type: "landing",
      custom_fields: {
        industry: " Fintech ", // trimmed
        cta_url: "https://example.com/go",
        count: 3, // coerced to string
        blank: "   ", // dropped
        missing: null, // dropped
      },
    });
    expect(post?.collectionType).toBe("landing");
    expect(post?.customFields).toEqual({
      industry: "Fintech",
      cta_url: "https://example.com/go",
      count: "3",
    });
  });

  it("defaults to Classic (null type, empty fields) when the payload omits them", () => {
    const post = normalizePost(base);
    expect(post?.collectionType).toBeNull();
    expect(post?.customFields).toEqual({});
  });

  it("tolerates a malformed custom_fields blob", () => {
    expect(normalizePost({ ...base, custom_fields: "nope" })?.customFields).toEqual({});
    expect(normalizePost({ ...base, custom_fields: ["a", "b"] })?.customFields).toEqual({});
  });
});
