import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Lets several local demo servers (one per site) run from one checkout.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Pin the app root: this repo is a standalone app, and without an explicit
  // root Next infers one from the nearest parent lockfile — wrong (and
  // build-breaking) when the repo is checked out inside another project.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
