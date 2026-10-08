// Local stand-in for /api/integrations/published. Each demo site's key picks
// its own frozen export: lb_local_<name> → published-<name>.json.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2];
const DROP = /FDA|Fitbit|Harborlight|Bioburden/i;
const cache = new Map();
function itemsFor(key) {
  const name = key?.startsWith("lb_local_") ? key.slice(9) : null;
  const file = name && name !== "stub" ? `published-${name}.json` : "published.json";
  if (!cache.has(file)) cache.set(file, JSON.parse(readFileSync(join(dir, file), "utf8")).items.filter((a) => !DROP.test(a.title)));
  return cache.get(file);
}
createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  res.setHeader("content-type", "application/json");
  if (!u.pathname.endsWith("/published")) { res.statusCode = 404; return res.end("{}"); }
  const items = itemsFor(req.headers["x-integrations-key"]);
  const slug = u.searchParams.get("slug");
  if (slug) { const a = items.find((i) => i.slug === slug); res.statusCode = a ? 200 : 404; return res.end(JSON.stringify(a ?? { error: "not_found" })); }
  const limit = Number(u.searchParams.get("limit") ?? 1000);
  const start = Number(u.searchParams.get("cursor") ?? 0);
  const page = items.slice(start, start + limit);
  const more = start + limit < items.length;
  res.end(JSON.stringify({ items: page, count: page.length, has_more: more, next_cursor: more ? String(start + limit) : null }));
}).listen(9011, () => console.log("stub on :9011"));
