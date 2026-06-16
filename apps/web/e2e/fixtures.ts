import { test as base, type Page } from "@playwright/test";
import { join } from "path";

const AUTH_STATE = join(process.cwd(), "e2e/.auth-state.json");

type AuthFixtures = { authenticatedPage: Page };

export const test = base.extend<AuthFixtures>({
	authenticatedPage: async ({ browser }, use) => {
		const context = await browser.newContext({ storageState: AUTH_STATE });
		const page = await context.newPage();
		await use(page);
		await context.close();
	},
});

export { expect } from "@playwright/test";
