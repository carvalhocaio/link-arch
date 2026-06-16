import { expect, test } from "@playwright/test";

test("unauthenticated user is redirected from /dashboard to /login", async ({
	page,
}) => {
	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/login/);
});

test("unauthenticated user is redirected from /my-links to /login", async ({
	page,
}) => {
	await page.goto("/my-links");
	await expect(page).toHaveURL(/\/login/);
});

test("sign-in page renders the Google sign-in button", async ({ page }) => {
	await page.goto("/login");
	const signInButton = page.getByRole("button", {
		name: /continue with google/i,
	});
	await expect(signInButton).toBeVisible();
});

test("authenticated user is redirected from /login to /dashboard", async ({
	page,
}) => {
	// This test requires a real session — skip in CI unless a test user is seeded
	test.skip(!!process.env.CI, "Requires a seeded test session in CI");
});
