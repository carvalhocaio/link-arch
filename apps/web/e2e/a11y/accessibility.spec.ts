import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function checkA11y(page: import("@playwright/test").Page, url: string) {
	await page.goto(url);
	const results = await new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
		.analyze();
	expect(results.violations).toEqual([]);
}

test("home page has no WCAG 2.1 AA accessibility violations", async ({
	page,
}) => {
	await checkA11y(page, "/");
});

test("sign-in page has no WCAG 2.1 AA accessibility violations", async ({
	page,
}) => {
	await checkA11y(page, "/login");
});
