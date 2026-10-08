// Local multi-site demo: a stub feed on :9011 plus one Lettersprite dev server
// per site, each with its own env (.demo-data/env-<name>.json), port and build
// folder. Usage: node scripts/demo/launch.mjs   (stop: pkill -f "next dev -p 900")
// .demo-data/ holds exported customer posts + settings and is git-ignored.
import { spawn } from "node:child_process";
import { readFileSync, openSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const app = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dir = join(app, ".demo-data");
spawn(process.execPath, [join(app, "scripts/demo/stub.mjs"), dir], {
  stdio: ["ignore", openSync(join(dir, "stub.log"), "w"), "ignore"],
  detached: true,
}).unref();
const sites = [
  { name: "letterstory", label: "Letterstory", port: 9000 },
  { name: "crmconfessions", label: "CRM Confessions · Quill", port: 9001 },
  { name: "warehousewire", label: "Warehouse Wire · Prequel", port: 9002 },
  { name: "bedsidestandard", label: "Bedside Standard · Ascenix", port: 9003 },
];
const peers = JSON.stringify(sites.map((s) => ({ label: s.label, url: `http://localhost:${s.port}` })));
for (const s of sites) {
  const env = JSON.parse(readFileSync(join(dir, `env-${s.name}.json`), "utf8"));
  Object.assign(env, {
    LETTERBRACE_API_URL: "http://localhost:9011",
    SITE_URL: `http://localhost:${s.port}`,
    SITE_DESIGN_COMPARE: "true",
    SITE_DEMO_PEERS: peers,
    SITE_DEMO_SELF: s.label,
    NEXT_DIST_DIR: `.next-${s.name}`,
    PORT: String(s.port),
  });
  const log = openSync(join(dir, `dev-${s.name}.log`), "w");
  const child = spawn("npx", ["next", "dev", "-p", String(s.port)], {
    cwd: app,
    env: { ...process.env, ...env },
    stdio: ["ignore", log, log],
    detached: true,
  });
  child.unref();
  console.log(s.label, "→", `http://localhost:${s.port}`, "pid", child.pid);
}
