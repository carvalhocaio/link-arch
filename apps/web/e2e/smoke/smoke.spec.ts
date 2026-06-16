import { expect, test } from "@playwright/test";

test("GET /api/health returns 200 with expected shape", async ({ request }) => {
	const res = await request.get("/api/health");
	expect(res.ok()).toBe(true);
	const body = await res.json();
	expect(body).toHaveProperty("title", "Link Arch");
	expect(body).toHaveProperty("version");
});

test("home page loads and renders the main heading", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/LinkArch/i);
});

test("unknown key returns a response (not a crash)", async ({ request }) => {
	const res = await request.get("/smoke-test-nonexistent-key-xyz", {
		maxRedirects: 0,
	});
	// Either 404 (not found) or 3xx redirect — both are valid; what's not valid is a 500
	expect(res.status()).not.toBe(500);
});
