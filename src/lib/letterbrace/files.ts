import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { env } from "@/env";
import { type BodyStyle, renderBody } from "./markdown";

/**
 * Posts kept as Markdown files in the site's own repo.
 *
 * A site that has a posts directory (`content/posts` unless LETTER_CONTENT_DIR
 * names another) reads its posts from there and never from the API. That is
 * what a site Letter moved to code is: its own copy of this repo, every
 * published post one `<slug>.md` file, and each new post a pull request that
 * adds one (Letter's docs/architecture/phantom-code.md).
 *
 * A file is the `/published` article it came from: its frontmatter carries the
 * same fields the API serves (`title`, `slug`, `article_id`, `published_at`,
 * `cover_image`, `author_profile`, `paper_trail`, `sponsor_disclosure`, …) and
 * its body is the article as Markdown. So a file goes through `normalizePost`
 * exactly as an API item does, and nothing downstream knows which it read. A
 * file someone writes by hand needs only a title: the slug defaults to the file
 * name and the id to `file:<name>`.
 *
 * Letter writes a body as Markdown only when it renders back to the HTML the
 * post was published as; a body Markdown can't hold exactly stays that HTML,
 * marked `format: html`. The site's own look for its bodies (the classes its
 * links carry, …) is `content/posts.json`'s `body`, which the renderer
 * (`markdown.ts`, the same file Letter checks with) puts back on every element.
 */

/** The site's body style, from `<posts dir>.json` (`{ "body": … }`); none when absent. */
export function readBodyStyle(dir: string): BodyStyle {
  const file = `${dir.replace(/[\\/]+$/, "")}.json`;
  try {
    if (!existsSync(file)) return { tags: {} };
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { body?: BodyStyle };
    const body = parsed.body;
    return body && typeof body === "object" ? { ...body, tags: body.tags ?? {} } : { tags: {} };
  } catch {
    return { tags: {} };
  }
}

/** The posts directory when this site keeps its posts as files, else null. */
export function postFilesDir(): string | null {
  if (!env.contentDir) return null;
  const dir = join(process.cwd(), env.contentDir);
  try {
    return existsSync(dir) && statSync(dir).isDirectory() ? dir : null;
  } catch {
    return null;
  }
}

/** True when the site has real posts to show: an API key, a fixture, or post files. */
export function hasContentSource(hasLetterbraceKey: boolean): boolean {
  return hasLetterbraceKey || postFilesDir() !== null;
}

const FRONTMATTER = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** A post file split into its frontmatter (an object, maybe empty) and its Markdown body. */
export function parsePostFile(text: string): { data: Record<string, unknown>; body: string } {
  const source = text.replace(/^﻿/, "");
  const match = FRONTMATTER.exec(source);
  if (!match) return { data: {}, body: source };
  const parsed: unknown = parseYaml(match[1]);
  const data =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  // The blank line after the frontmatter is the file's, not the body's.
  return { data, body: source.slice(match[0].length).replace(/^\r?\n/, "") };
}

/**
 * One post file as the raw article `normalizePost` reads: its frontmatter, its
 * body rendered to HTML as `content`, and the file name standing in for a slug
 * or an id the frontmatter doesn't give.
 */
export function rawFromPostFile(
  text: string,
  fileName: string,
  style: BodyStyle = { tags: {} },
): Record<string, unknown> {
  const { data, body } = parsePostFile(text);
  const stem = basename(fileName).replace(/\.(md|markdown)$/i, "");
  return {
    ...data,
    slug: data.slug ?? stem,
    article_id: data.article_id ?? data.id ?? `file:${stem}`,
    content: renderBody(body, data.format === "html" ? "html" : "markdown", style),
  };
}

let cached: { dir: string; raws: Record<string, unknown>[] } | null = null;

/** Every post file in `dir`, as raw articles. Read once per build process. */
export function readPostFiles(dir: string): Record<string, unknown>[] {
  if (cached?.dir === dir) return cached.raws;
  const names = readdirSync(dir)
    .filter((n) => /\.(md|markdown)$/i.test(n) && !/^readme\./i.test(n))
    .sort();
  const style = readBodyStyle(dir);
  const raws = names.map((name) => rawFromPostFile(readFileSync(join(dir, name), "utf8"), name, style));
  cached = { dir, raws };
  return raws;
}
