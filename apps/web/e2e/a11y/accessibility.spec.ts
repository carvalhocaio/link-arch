import AxeBuilder from "@axe-core/playwright";
import { test as base, expect } from "@playwright/test";

import { test as authTest } from "../fixtures";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function checkA11y(page: import("@playwright/test").Page, url: string) {
	await page.goto(url);
	const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
	expect(results.violations).toEqual([]);
}

base("home page has no WCAG 2.1 AA accessibility violations", async ({ page }) => {
	await checkA11y(page, "/");
});

base("sign-in page has no WCAG 2.1 AA accessibility violations", async ({ page }) => {
	await checkA11y(page, "/login");
});

base("privacy page has no WCAG 2.1 AA accessibility violations", async ({ page }) => {
	await checkA11y(page, "/privacy");
});

base("terms page has no WCAG 2.1 AA accessibility violations", async ({ page }) => {
	await checkA11y(page, "/terms");
});

// The authenticated pages hold the table, the dialogs and every labelled input,
// so they are the ones most worth covering.
authTest("dashboard has no WCAG 2.1 AA accessibility violations", async ({ authenticatedPage }) => {
	await checkA11y(authenticatedPage, "/dashboard");
});

authTest("my-links has no WCAG 2.1 AA accessibility violations", async ({ authenticatedPage }) => {
	await checkA11y(authenticatedPage, "/my-links");
});
