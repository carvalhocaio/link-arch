import { writeFileSync } from "fs";
import { join } from "path";

export const E2E_USER_ID = "e2e-playwright-user-001";
export const E2E_SESSION_TOKEN = "e2e-playwright-session-token-fixed-abc123";

const STATE_FILE = join(process.cwd(), "e2e/.auth-state.json");

export default async function globalSetup() {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	if (process.env.DATABASE_URL) {
		// Dynamic imports so Node.js resolves them at runtime (not at parse time)
		const { default: postgres } = await import("postgres");
		const { drizzle } = await import("drizzle-orm/postgres-js");
		const { user, session } = await import("../lib/db/schema");

		const client = postgres(process.env.DATABASE_URL, { onnotice: () => {} });
		const db = drizzle(client);

		await db
			.insert(user)
			.values({
				id: E2E_USER_ID,
				name: "E2E Test User",
				email: "e2e@playwright.test",
				emailVerified: true,
				image: null,
			})
			.onConflictDoNothing();

		await db
			.insert(session)
			.values({
				id: "e2e-session-id-001",
				userId: E2E_USER_ID,
				token: E2E_SESSION_TOKEN,
				expiresAt,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.onConflictDoNothing();

		await client.end();
	}

	writeFileSync(
		STATE_FILE,
		JSON.stringify({
			cookies: [
				{
					name: "better-auth.session_token",
					value: E2E_SESSION_TOKEN,
					domain: "localhost",
					path: "/",
					expires: Math.floor(expiresAt.getTime() / 1000),
					httpOnly: true,
					secure: false,
					sameSite: "Lax",
				},
			],
			origins: [],
		}),
	);
}
