import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { isUrlReachable } from "../../lib/services/validator";

describe("isUrlReachable", () => {
	afterEach(() => {
		mock.restore();
	});

	it("returns true when fetch succeeds with ok response", async () => {
		spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(null, { status: 200 }),
		);
		expect(await isUrlReachable("https://example.com")).toBe(true);
	});

	it("returns false when fetch returns a non-ok response", async () => {
		spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(null, { status: 404 }),
		);
		expect(await isUrlReachable("https://example.com/notfound")).toBe(false);
	});

	it("returns false when fetch throws (network error)", async () => {
		spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
		expect(await isUrlReachable("https://unreachable.invalid")).toBe(false);
	});

	it("uses HEAD method", async () => {
		const fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(null, { status: 200 }),
		);
		await isUrlReachable("https://example.com");
		expect(fetchSpy).toHaveBeenCalledWith(
			"https://example.com",
			expect.objectContaining({ method: "HEAD" }),
		);
	});

	it("returns false when request is aborted (timeout)", async () => {
		spyOn(globalThis, "fetch").mockImplementation(
			((_url: any, options?: any) =>
				new Promise((_resolve, reject) => {
					options?.signal?.addEventListener("abort", () =>
						reject(new DOMException("Aborted", "AbortError")),
					);
				})) as any,
		);
		expect(await isUrlReachable("https://slow.example.com", 10)).toBe(false);
	});
});
