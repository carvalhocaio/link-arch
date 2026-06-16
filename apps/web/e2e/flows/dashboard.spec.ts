import { expect, test } from "@playwright/test";

test("unauthenticated visit to /dashboard redirects to /login", async ({
	page,
}) => {
	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/login/);
});

test("dashboard is accessible with a valid session", async ({ page }) => {
	test.skip(!!process.env.CI, "Requires a seeded test session in CI");
	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/dashboard/);
});
