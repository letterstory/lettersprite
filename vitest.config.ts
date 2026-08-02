import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// The blog has no runtime logic to speak of — it is content baked into HTML.
// The exception is the access classifier, which decides whether a request was a
// person or a machine, and is the one piece here whose mistakes are invisible
// in the rendered page. That is what this config exists for.
export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": resolve(__dirname, "src") } },
});
