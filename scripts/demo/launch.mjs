// Local multi-site demo: one Lettersprite dev server per site, each with its
// own env (.demo-data/env-<name>.json), frozen feed (.demo-data/published-<name>.json),
// redesign layout, port and build folder.
//   node scripts/demo/launch.mjs        stop: pkill -f "next dev -p 900"
// .demo-data/ holds exported customer posts + settings and is git-ignored.
import { spawn } from "node:child_process";
import { readFileSync, openSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITES } from "./sites.mjs";

const app = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dir = join(app, ".demo-data");
const peers = JSON.stringify(SITES.map((s) => ({ label: s.label, url: `http://localhost:${s.port}` })));

for (const s of SITES) {
  const env = JSON.parse(readFileSync(join(dir, `env-${s.name}.json`), "utf8"));
  delete env.LETTERBRACE_API_KEY;
  Object.assign(env, {
    LETTERBRACE_FIXTURE: `.demo-data/published-${s.name}.json`,
    SITE_URL: `http://localhost:${s.port}`,
    SITE_LAYOUT: s.layout,
    SITE_DESIGN_COMPARE: "true",
    SITE_DEMO_PEERS: peers,
    SITE_DEMO_SELF: s.label,
    NEXT_DIST_DIR: `.next-${s.name}`,
    POSTS_LIMIT: "60",
  });
  const log = openSync(join(dir, `dev-${s.name}.log`), "w");
  spawn("npx", ["next", "dev", "-p", String(s.port)], {
    cwd: app,
    env: { ...process.env, ...env },
    stdio: ["ignore", log, log],
    detached: true,
  }).unref();
  console.log(`${s.label} (${s.layout}) → http://localhost:${s.port}`);
}
