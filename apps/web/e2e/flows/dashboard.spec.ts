import { expect, test } from "@playwright/test";
import { test as authTest } from "../fixtures";

test("unauthenticated visit to /dashboard redirects to /login", async ({
	page,
}) => {
	await page.goto("/dashboard");
	await expect(page).toHaveURL(/\/login/);
});

authTest(
	"dashboard is accessible with a valid session",
	async ({ authenticatedPage: page }) => {
		await page.goto("/dashboard");
		await expect(page).toHaveURL(/\/dashboard/);
	},
);
