// Deploy the multi-site demo to Vercel: one project per site, each built from
// HEAD plus its frozen feed (.demo-data/published-<name>.json), so no API key
// is involved and every build is noindex (SITE_DESIGN_COMPARE).
//   node scripts/demo/deploy.mjs [--scope letterbrace]
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITES } from "./sites.mjs";

const app = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const scope = process.argv.includes("--scope") ? process.argv[process.argv.indexOf("--scope") + 1] : "letterbrace";
const project = (s) => `letter-blog-redesign-${s.name}`;
const urlOf = (s) => `https://${project(s)}.vercel.app`;
const peers = JSON.stringify(SITES.map((s) => ({ label: s.label, url: urlOf(s) })));
const vercel = (args, cwd) => execFileSync("vercel", [...args, "--scope", scope], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

for (const s of SITES) {
  const dir = mkdtempSync(join(tmpdir(), `demo-${s.name}-`));
  execFileSync("sh", ["-c", `git -C "${app}" archive HEAD | tar -x -C "${dir}"`]);
  mkdirSync(join(dir, ".demo-data"));
  cpSync(join(app, ".demo-data", `published-${s.name}.json`), join(dir, ".demo-data", `published-${s.name}.json`));
  writeFileSync(join(dir, ".vercelignore"), "node_modules\n.next*\n");
  // A project created from the CLI starts as "Other" and serves the build as
  // static files (every route 404s); pin the framework.
  writeFileSync(join(dir, "vercel.json"), JSON.stringify({ framework: "nextjs" }));

  const env = JSON.parse(readFileSync(join(app, ".demo-data", `env-${s.name}.json`), "utf8"));
  delete env.LETTERBRACE_API_KEY;
  Object.assign(env, {
    LETTERBRACE_FIXTURE: `.demo-data/published-${s.name}.json`,
    LETTERBRACE_ACCESS_URL: "",
    SITE_URL: urlOf(s),
    SITE_LAYOUT: s.layout,
    SITE_DESIGN_COMPARE: "true",
    SITE_DEMO_PEERS: peers,
    SITE_DEMO_SELF: s.label,
    POSTS_LIMIT: "60",
  });
  const flags = Object.entries(env).flatMap(([k, v]) => ["--build-env", `${k}=${v}`, "--env", `${k}=${v}`]);

  try {
    vercel(["project", "add", project(s)], dir);
  } catch {
    /* already exists */
  }
  vercel(["link", "--yes", "--project", project(s)], dir);
  const deployment = vercel(["deploy", "--prod", "--yes", ...flags], dir).trim().split("\n").pop();
  // Pin the address the other sites' switches link to.
  vercel(["alias", "set", deployment, new URL(urlOf(s)).host], dir);
  console.log(`${s.label} (${s.layout}) → ${urlOf(s)}`);
}
