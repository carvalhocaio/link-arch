import { lookup } from "node:dns/promises";

const DEFAULT_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 5;

export interface ReachabilityOptions {
	timeoutMs?: number;
	/** Injectable for tests, so unit runs never touch the network. */
	resolveHost?: (hostname: string) => Promise<string[]>;
}

/**
 * Local and test setups legitimately shorten loopback URLs — the e2e suite points
 * at `/api/health` precisely so it never reaches the internet. Opt in explicitly
 * via `ALLOW_PRIVATE_TARGET_URLS`; it must stay unset in production.
 */
function allowsPrivateTargets() {
	return process.env.ALLOW_PRIVATE_TARGET_URLS === "true";
}

async function defaultResolveHost(hostname: string): Promise<string[]> {
	const records = await lookup(hostname, { all: true });
	return records.map((record) => record.address);
}

function isPrivateIpv4(address: string): boolean {
	const octets = address.split(".").map(Number);
	if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
		return true; // Unparseable: fail closed.
	}

	const [a, b] = octets;

	return (
		a === 0 || // 0.0.0.0/8
		a === 10 || // 10.0.0.0/8
		a === 127 || // loopback
		(a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGNAT
		(a === 169 && b === 254) || // link-local, incl. cloud metadata
		(a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
		(a === 192 && b === 0) || // 192.0.0.0/24
		(a === 192 && b === 168) || // 192.168.0.0/16
		(a === 198 && b >= 18 && b <= 19) || // 198.18.0.0/15 benchmarking
		a >= 224 // multicast + reserved
	);
}

function isPrivateIpv6(address: string): boolean {
	const normalized = address.toLowerCase().split("%")[0];

	// IPv4-mapped (::ffff:127.0.0.1) must be judged by its IPv4 half.
	const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
	if (mapped) return isPrivateIpv4(mapped[1]);

	return (
		normalized === "::" ||
		normalized === "::1" ||
		normalized.startsWith("fc") || // fc00::/7 unique local
		normalized.startsWith("fd") ||
		normalized.startsWith("fe8") || // fe80::/10 link-local
		normalized.startsWith("fe9") ||
		normalized.startsWith("fea") ||
		normalized.startsWith("feb")
	);
}

function isPrivateAddress(address: string): boolean {
	return address.includes(":") ? isPrivateIpv6(address) : isPrivateIpv4(address);
}

/**
 * Rejects anything that is not a public http(s) target, so a user-supplied URL
 * cannot be used to probe the internal network.
 *
 * Note: this narrows SSRF but does not eliminate DNS rebinding — the name is
 * resolved here and again by `fetch`, and a hostile resolver can answer
 * differently each time. Closing that fully means pinning the resolved address
 * at connection time via a custom agent.
 */
async function isSafeTarget(url: string, resolveHost: (h: string) => Promise<string[]>) {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return false;
	}

	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		return false;
	}

	if (allowsPrivateTargets()) {
		return true;
	}

	try {
		const addresses = await resolveHost(parsed.hostname);
		// Every answer must be public: a round-robin record mixing a public and a
		// private address would otherwise slip through.
		return addresses.length > 0 && !addresses.some(isPrivateAddress);
	} catch {
		return false;
	}
}

export async function isUrlReachable(
	url: string,
	{ timeoutMs, resolveHost = defaultResolveHost }: ReachabilityOptions = {},
): Promise<boolean> {
	const limit =
		timeoutMs ?? Number.parseInt(process.env.FORWARD_TIMEOUT_MS ?? String(DEFAULT_TIMEOUT_MS), 10);

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), limit);

	try {
		let current = url;

		// Redirects are followed by hand so that every hop is re-validated; letting
		// fetch follow them would allow a public URL to bounce into the private network.
		for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
			if (!(await isSafeTarget(current, resolveHost))) {
				return false;
			}

			const response = await fetch(current, {
				method: "HEAD",
				signal: controller.signal,
				redirect: "manual",
			});

			if (response.status < 300 || response.status >= 400) {
				return response.ok;
			}

			const location = response.headers.get("location");
			if (!location) return false;

			current = new URL(location, current).toString();
		}

		return false;
	} catch {
		return false;
	} finally {
		clearTimeout(timeout);
	}
}
