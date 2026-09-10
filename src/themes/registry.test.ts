import { describe, expect, it } from "vitest";
import registry from "@letterstory/design/themes.json" with { type: "json" };
import { themes, DEFAULT_THEME } from "./index";

/**
 * The theme registry is shared, this repo is one of its two ends.
 *
 * `@letterstory/design/themes.json` says which themes a customer may CHOOSE (the
 * app renders that list in Setup and stores the chosen value in
 * `phantom_blogs.theme`); `src/themes/` says what each one LOOKS like. Nothing
 * connects the two at build time, and `getActiveTheme()` answers an unknown
 * `THEME` with a console warning and the default — so a theme registered over
 * there and missing here renders as `sleek` on a live customer site, silently.
 *
 * These tests are that connection: the registry and this directory must name exactly
 * the same set, in both directions. They agree today (55 themes); the tests exist so the
 * next theme added at either end cannot land alone.
 */

const registered = new Set(registry.themes.map((t) => t.value));
const implemented = new Set(Object.keys(themes));

describe("theme registry ⇄ implementations", () => {
	it("every registered theme is implemented here", () => {
		const missing = [...registered].filter((v) => !implemented.has(v)).sort();
		expect(
			missing,
			`Registered in @letterstory/design but not implemented in src/themes/. A deployment set to one of ` +
				`these renders "${DEFAULT_THEME}" instead, with only a console warning. Add src/themes/<name>.ts ` +
				`(copy sleek.ts), register it in index.ts, run \`npm run generate:covers\` — or remove it from ` +
				`design/themes.json in letterstory/letterstory:\n${missing.join("\n")}`
		).toEqual([]);
	});

	it("every implemented theme is registered, so a customer can actually pick it", () => {
		const unreachable = [...implemented].filter((v) => !registered.has(v)).sort();
		expect(
			unreachable,
			`Implemented here but absent from @letterstory/design/themes.json, so nobody can select it. Add it ` +
				`to design/themes.json in letterstory/letterstory (value, label, hint, group, tags):\n${unreachable.join("\n")}`
		).toEqual([]);
	});

	it("the default theme is implemented and registered", () => {
		expect(implemented.has(DEFAULT_THEME)).toBe(true);
		expect(registered.has(DEFAULT_THEME)).toBe(true);
	});
});
