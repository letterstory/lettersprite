/**
 * In-memory CIDR matching — the mechanics under `verified` and `provenance`.
 *
 * Pure and dependency-free: CIDR strings compile to sorted numeric intervals
 * (u32 for v4, 128-bit BigInt for v6), lookups are a binary search. At the
 * scale involved (a few hundred verification prefixes, ~100k provenance
 * prefixes) a lookup is microseconds — cheap enough to run on the proxy's
 * post-response path for every request without a thought.
 *
 * THE PRIVACY CONTRACT LIVES HERE: an IP comes in, a boolean or a label comes
 * out, and the IP is never stored, logged, or shipped. This module is the
 * whole reason the reports can carry "came from AWS" without carrying an
 * address.
 *
 * Malformed inputs (junk CIDR in a vendor file, junk header instead of an IP)
 * compile to nothing / match nothing. Failure here means a missing label,
 * never a wrong one and never an error on the request path.
 */

export interface RangeSet {
	/** Sorted, non-overlapping-enough [lo, hi] inclusive intervals. */
	v4: [number, number][];
	v6: [bigint, bigint][];
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function parseV4(addr: string): number | null {
	const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(addr);
	if (!m) return null;
	const octets = [m[1], m[2], m[3], m[4]].map(Number);
	if (octets.some((o) => o > 255)) return null;
	// >>> 0 keeps the result an unsigned 32-bit value.
	return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

function parseV6(addr: string): bigint | null {
	// A v4-mapped tail ("::ffff:1.2.3.4") folds into the last 32 bits.
	let tail = 0n;
	let tailBits = 0;
	let head = addr;
	const v4tail = /^(.*:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(addr);
	if (v4tail) {
		const v4 = parseV4(v4tail[2]);
		if (v4 === null) return null;
		head = `${v4tail[1]}`;
		tail = BigInt(v4);
		tailBits = 32;
		// "::1.2.3.4" leaves head "::"; "a::b:1.2.3.4" leaves "a::b:" — trim the
		// dangling separator unless it's part of "::".
		if (!head.endsWith("::")) head = head.slice(0, -1);
	}

	const parts = head.split("::");
	if (parts.length > 2) return null;
	const left = parts[0] === "" ? [] : parts[0].split(":");
	const right = parts.length === 2 ? (parts[1] === "" ? [] : parts[1].split(":")) : [];
	const groupCount = left.length + right.length + tailBits / 16;
	if (parts.length === 1 && groupCount !== 8) return null;
	if (groupCount > 8) return null;

	const groups: bigint[] = [];
	for (const g of left) {
		if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
		groups.push(BigInt(parseInt(g, 16)));
	}
	const zeros = 8 - left.length - right.length - tailBits / 16;
	for (let i = 0; i < zeros; i++) groups.push(0n);
	for (const g of right) {
		if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
		groups.push(BigInt(parseInt(g, 16)));
	}

	let n = 0n;
	for (const g of groups) n = (n << 16n) | g;
	if (tailBits > 0) n = (n << 32n) | tail;
	return n;
}

export type ParsedIp = { v: 4; n: number } | { v: 6; n: bigint } | null;

export function parseIp(raw: string | null | undefined): ParsedIp {
	const s = (raw ?? "").trim().toLowerCase();
	if (!s) return null;
	if (s.includes(":") && !s.includes(".")) {
		const n = parseV6(s);
		return n === null ? null : { v: 6, n };
	}
	if (s.includes(":")) {
		// v4-mapped v6 arriving as the client address — treat as the v4 inside.
		const m = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(s);
		const v4 = m ? parseV4(m[1]) : null;
		return v4 === null ? null : { v: 4, n: v4 };
	}
	const v4 = parseV4(s);
	return v4 === null ? null : { v: 4, n: v4 };
}

// ---------------------------------------------------------------------------
// Compilation
// ---------------------------------------------------------------------------

const V6_ALL = (1n << 128n) - 1n;

/** CIDR strings → sorted interval sets. Junk entries are skipped, not fatal. */
export function compileRanges(cidrs: string[]): RangeSet {
	const v4: [number, number][] = [];
	const v6: [bigint, bigint][] = [];

	for (const cidr of cidrs) {
		const [addr, bitsRaw] = cidr.trim().toLowerCase().split("/");
		if (addr.includes(":")) {
			const n = parseV6(addr);
			if (n === null) continue;
			const bits = bitsRaw === undefined ? 128 : Number(bitsRaw);
			if (!Number.isInteger(bits) || bits < 0 || bits > 128) continue;
			const mask = bits === 0 ? V6_ALL : (1n << BigInt(128 - bits)) - 1n;
			const lo = n & ~mask & V6_ALL;
			v6.push([lo, lo | mask]);
		} else {
			const n = parseV4(addr);
			if (n === null) continue;
			const bits = bitsRaw === undefined ? 32 : Number(bitsRaw);
			if (!Number.isInteger(bits) || bits < 0 || bits > 32) continue;
			const size = bits === 0 ? 0x100000000 : 2 ** (32 - bits);
			const lo = bits === 0 ? 0 : n - (n % size);
			v4.push([lo, lo + size - 1]);
		}
	}

	v4.sort((a, b) => a[0] - b[0]);
	v6.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
	return { v4, v6 };
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

function search<T extends number | bigint>(intervals: [T, T][], n: T): boolean {
	let lo = 0;
	let hi = intervals.length - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		const [start, end] = intervals[mid];
		if (n < start) hi = mid - 1;
		else if (n > end) lo = mid + 1;
		else return true;
	}
	return false;
}

export function ipInRangeSet(ip: string | null | undefined, set: RangeSet): boolean {
	const parsed = parseIp(ip);
	if (!parsed) return false;
	return parsed.v === 4 ? search(set.v4, parsed.n) : search(set.v6, parsed.n);
}
