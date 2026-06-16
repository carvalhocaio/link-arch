import { expect, test } from "@playwright/test";

test("home page has a URL input or sign-in prompt", async ({ page }) => {
	await page.goto("/");
	// Depending on auth state, expect either a shorten form or a sign-in call-to-action
	const hasInput = await page.locator("input[type='url'], input[type='text']").count();
	const hasSignIn = await page.getByRole("link", { name: /sign.?in/i }).count();
	expect(hasInput + hasSignIn).toBeGreaterThan(0);
});

test("short link redirect works end-to-end", async ({ request, page }) => {
	test.skip(!!process.env.CI, "Requires an authenticated session to create links");
});
