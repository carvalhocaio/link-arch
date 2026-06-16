import { expect, test } from "@playwright/test";
import { test as authTest } from "../fixtures";

test("home page has a URL input or sign-in prompt", async ({ page }) => {
	await page.goto("/");
	// Depending on auth state, expect either a shorten form or a sign-in call-to-action
	const hasInput = await page.locator("input[type='url'], input[type='text']").count();
	const hasSignIn = await page.getByRole("link", { name: /sign.?in/i }).count();
	expect(hasInput + hasSignIn).toBeGreaterThan(0);
});

authTest(
	"short link redirect works end-to-end",
	async ({ authenticatedPage: page }) => {
		const res = await page.request.post("/api/shorten", {
			data: { url: "https://example.com" },
			headers: { "Content-Type": "application/json" },
		});
		expect(res.ok()).toBe(true);
		const { key } = await res.json();

		const redirect = await page.request.get(`/${key}`, { maxRedirects: 0 });
		expect([301, 302, 307, 308]).toContain(redirect.status());
	},
);
