import { expect, test } from "@playwright/test";
import { test as authTest } from "../fixtures";

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

authTest(
	"authenticated user is redirected from /login to /dashboard",
	async ({ authenticatedPage: page }) => {
		await page.goto("/login");
		await expect(page).toHaveURL(/\/dashboard/);
	},
);
