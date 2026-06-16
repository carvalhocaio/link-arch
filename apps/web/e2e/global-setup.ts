import { writeFileSync } from "fs";
import { join } from "path";
import { webcrypto } from "node:crypto";

export const E2E_USER_ID = "e2e-playwright-user-001";
export const E2E_SESSION_TOKEN = "e2e-playwright-session-token-fixed-abc123";

const STATE_FILE = join(process.cwd(), "e2e/.auth-state.json");

// Replicates better-call's signCookieValue: `${value}.${base64(HMAC-SHA256(value, secret))}`
async function signCookieValue(value: string, secret: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await webcrypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await webcrypto.subtle.sign("HMAC", key, enc.encode(value));
	const base64Sig = btoa(String.fromCharCode(...new Uint8Array(sig)));
	return `${value}.${base64Sig}`;
}

export default async function globalSetup() {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	const secret =
		process.env.BETTER_AUTH_SECRET ?? "ci-test-secret-not-used-in-prod";

	if (process.env.DATABASE_URL) {
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

	const signedToken = await signCookieValue(E2E_SESSION_TOKEN, secret);

	writeFileSync(
		STATE_FILE,
		JSON.stringify({
			cookies: [
				{
					name: "better-auth.session_token",
					value: signedToken,
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
