// Deploy the multi-site demo to Vercel: one project per site, each built from
// HEAD plus its frozen feed (.demo-data/published-<name>.json), so no API key
// is involved and every build is noindex (SITE_DESIGN_COMPARE).
//   node scripts/demo/deploy.mjs [--scope letterbrace] [--only name,name]
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

// --only a,b redeploys just those sites (by name).
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1].split(",") : null;

/** The CLI's upload occasionally dies on a transient "fetch failed"; retry. */
function withRetry(fn, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      return fn();
    } catch (e) {
      if (i >= tries) throw e;
      console.error(`retrying (${i}/${tries - 1}) after: ${String(e.message).split("\n")[0].slice(0, 120)}`);
    }
  }
}

for (const s of SITES.filter((x) => !only || only.includes(x.name))) {
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
  const out = withRetry(() => vercel(["deploy", "--prod", "--yes", ...flags], dir));
  // The CLI's stdout format varies by version (bare URL or JSON); take the
  // deployment's own URL either way.
  const deployment = out.match(/https:\/\/[a-z0-9-]+-[a-z0-9]+-letterbrace\.vercel\.app/)?.[0] ?? out.match(/https:\/\/\S+\.vercel\.app/)?.[0];
  if (!deployment) throw new Error(`no deployment URL in output:\n${out}`);
  // Pin the address the other sites' switches link to.
  vercel(["alias", "set", deployment, new URL(urlOf(s)).host], dir);
  console.log(`${s.label} (${s.layout}) → ${urlOf(s)}`);
}
