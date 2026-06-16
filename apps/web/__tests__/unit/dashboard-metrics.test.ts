import { describe, expect, it } from "bun:test";
import type { AdminUrl } from "../../lib/api";
import { buildQuickStats } from "../../lib/dashboard-metrics";

function makeUrl(overrides: Partial<AdminUrl> = {}): AdminUrl {
	return {
		id: 1,
		key: "abc1234",
		targetUrl: "https://example.com",
		isActive: true,
		clicks: 0,
		expiresAt: null,
		createdAt: new Date().toISOString(),
		...overrides,
	};
}

describe("buildQuickStats", () => {
	it("returns 3 stats", () => {
		expect(buildQuickStats([])).toHaveLength(3);
	});

	it("total clicks is 0 for empty list", () => {
		const stats = buildQuickStats([]);
		const total = stats.find((s) => s.title === "Total Clicks");
		expect(total?.value).toBe("0");
	});

	it("sums clicks across all URLs", () => {
		const urls = [makeUrl({ clicks: 10 }), makeUrl({ clicks: 25 })];
		const stats = buildQuickStats(urls);
		const total = stats.find((s) => s.title === "Total Clicks");
		expect(total?.value).toBe("35");
	});

	it("counts only active links", () => {
		const urls = [
			makeUrl({ isActive: true }),
			makeUrl({ isActive: false }),
			makeUrl({ isActive: true }),
		];
		const stats = buildQuickStats(urls);
		const active = stats.find((s) => s.title === "Active Links");
		expect(active?.value).toBe("2");
	});

	it("shows scheduled for expiry count in active links detail", () => {
		const urls = [
			makeUrl({ expiresAt: "2099-01-01T00:00:00.000Z" }),
			makeUrl({ expiresAt: null }),
		];
		const stats = buildQuickStats(urls);
		const active = stats.find((s) => s.title === "Active Links");
		expect(active?.detail).toContain("1");
	});

	it("shows dash for top performing when no links", () => {
		const stats = buildQuickStats([]);
		const top = stats.find((s) => s.title === "Top Performing");
		expect(top?.value).toBe("-");
	});

	it("shows the key with most clicks as top performing", () => {
		const urls = [
			makeUrl({ key: "low", clicks: 5 }),
			makeUrl({ key: "high", clicks: 100 }),
		];
		const stats = buildQuickStats(urls);
		const top = stats.find((s) => s.title === "Top Performing");
		expect(top?.value).toBe("/high");
	});

	it("shows no change when both current and previous month clicks are 0", () => {
		const stats = buildQuickStats([]);
		const total = stats.find((s) => s.title === "Total Clicks");
		expect(total?.detail).toBe("No change from last month");
	});

	it("shows +100% when previous month had 0 clicks and current has some", () => {
		const now = new Date();
		const thisMonth = new Date(
			Date.UTC(now.getFullYear(), now.getMonth(), 15),
		).toISOString();
		const urls = [makeUrl({ clicks: 10, createdAt: thisMonth })];
		const stats = buildQuickStats(urls, now);
		const total = stats.find((s) => s.title === "Total Clicks");
		expect(total?.detail).toContain("+100.0%");
	});
});
