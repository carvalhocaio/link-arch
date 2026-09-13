import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { isUrlReachable } from "../../lib/services/validator";

/** Keeps unit runs off the network: every hostname resolves to a public address. */
const resolvePublic = async () => ["93.184.216.34"];

describe("isUrlReachable", () => {
	afterEach(() => {
		mock.restore();
		// Assigning undefined would store the string "undefined".
		delete process.env.ALLOW_PRIVATE_TARGET_URLS;
	});

	it("returns true when fetch succeeds with ok response", async () => {
		spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
		expect(await isUrlReachable("https://example.com", { resolveHost: resolvePublic })).toBe(true);
	});

	it("returns false when fetch returns a non-ok response", async () => {
		spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 404 }));
		expect(
			await isUrlReachable("https://example.com/notfound", { resolveHost: resolvePublic }),
		).toBe(false);
	});

	it("returns false when fetch throws (network error)", async () => {
		spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
		expect(
			await isUrlReachable("https://unreachable.invalid", { resolveHost: resolvePublic }),
		).toBe(false);
	});

	it("uses HEAD method and does not auto-follow redirects", async () => {
		const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(null, { status: 200 }),
		);
		await isUrlReachable("https://example.com", { resolveHost: resolvePublic });
		expect(fetchSpy).toHaveBeenCalledWith(
			"https://example.com",
			expect.objectContaining({ method: "HEAD", redirect: "manual" }),
		);
	});

	it("returns false when request is aborted (timeout)", async () => {
		spyOn(globalThis, "fetch").mockImplementation(
			((_url: unknown, options?: { signal?: AbortSignal }) =>
				new Promise((_resolve, reject) => {
					options?.signal?.addEventListener("abort", () =>
						reject(new DOMException("Aborted", "AbortError")),
					);
				})) as typeof fetch,
		);
		expect(
			await isUrlReachable("https://slow.example.com", {
				timeoutMs: 10,
				resolveHost: resolvePublic,
			}),
		).toBe(false);
	});

	describe("SSRF guard", () => {
		it.each([
			["loopback IPv4", "127.0.0.1"],
			["private 10/8", "10.0.0.5"],
			["private 172.16/12", "172.20.1.1"],
			["private 192.168/16", "192.168.1.1"],
			["cloud metadata link-local", "169.254.169.254"],
			["CGNAT", "100.100.0.1"],
			["unspecified", "0.0.0.0"],
			["IPv6 loopback", "::1"],
			["IPv6 unique local", "fd00::1"],
			["IPv4-mapped loopback", "::ffff:127.0.0.1"],
		])("blocks %s without issuing a request", async (_label, address) => {
			const fetchSpy = spyOn(globalThis, "fetch");
			expect(
				await isUrlReachable("https://internal.example.com", {
					resolveHost: async () => [address],
				}),
			).toBe(false);
			expect(fetchSpy).not.toHaveBeenCalled();
		});

		it("blocks when any address in a round-robin record is private", async () => {
			const fetchSpy = spyOn(globalThis, "fetch");
			expect(
				await isUrlReachable("https://mixed.example.com", {
					resolveHost: async () => ["93.184.216.34", "10.0.0.1"],
				}),
			).toBe(false);
			expect(fetchSpy).not.toHaveBeenCalled();
		});

		it.each(["file:///etc/passwd", "ftp://example.com", "gopher://example.com"])(
			"rejects non-http scheme %s",
			async (url) => {
				const fetchSpy = spyOn(globalThis, "fetch");
				expect(await isUrlReachable(url, { resolveHost: resolvePublic })).toBe(false);
				expect(fetchSpy).not.toHaveBeenCalled();
			},
		);

		it("rejects an unparseable URL", async () => {
			expect(await isUrlReachable("not a url", { resolveHost: resolvePublic })).toBe(false);
		});

		it("returns false when DNS resolution fails", async () => {
			expect(
				await isUrlReachable("https://nxdomain.example", {
					resolveHost: async () => {
						throw new Error("ENOTFOUND");
					},
				}),
			).toBe(false);
		});

		it("re-validates each redirect hop and blocks a bounce into the private network", async () => {
			spyOn(globalThis, "fetch").mockResolvedValue(
				new Response(null, { status: 302, headers: { location: "http://169.254.169.254/" } }),
			);
			expect(
				await isUrlReachable("https://public.example.com", {
					resolveHost: async (hostname) =>
						hostname === "169.254.169.254" ? ["169.254.169.254"] : ["93.184.216.34"],
				}),
			).toBe(false);
		});

		it("follows a redirect to another public host", async () => {
			const fetchSpy = spyOn(globalThis, "fetch")
				.mockResolvedValueOnce(
					new Response(null, { status: 301, headers: { location: "https://www.example.com/" } }),
				)
				.mockResolvedValueOnce(new Response(null, { status: 200 }));
			expect(
				await isUrlReachable("https://example.com", { resolveHost: resolvePublic }),
			).toBe(true);
			expect(fetchSpy).toHaveBeenCalledTimes(2);
		});

		it("gives up after too many redirects", async () => {
			spyOn(globalThis, "fetch").mockResolvedValue(
				new Response(null, { status: 302, headers: { location: "https://example.com/next" } }),
			);
			expect(await isUrlReachable("https://example.com", { resolveHost: resolvePublic })).toBe(
				false,
			);
		});

		it("allows private targets when ALLOW_PRIVATE_TARGET_URLS is set", async () => {
			process.env.ALLOW_PRIVATE_TARGET_URLS = "true";
			spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
			expect(
				await isUrlReachable("http://localhost:3001/api/health", {
					resolveHost: async () => ["127.0.0.1"],
				}),
			).toBe(true);
		});
	});
});
