import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { join } from "node:path";
import postgres from "postgres";
import { db } from "../../lib/db";
import * as schema from "../../lib/db/schema";
import { session, user } from "../../lib/db/schema";

const MIGRATIONS_PATH = join(
	import.meta.dir,
	"../../../../packages/db/drizzle",
);

export const TEST_USER_ID = "test-user-integration-001";
export const TEST_USER_ID_2 = "test-user-integration-002";

export async function setupTestDb() {
	// Suppress Drizzle NOTICE messages ("schema already exists", etc.)
	const silentClient = postgres(process.env.DATABASE_URL!, { onnotice: () => {} });
	const silentDb = drizzle(silentClient, { schema });
	await migrate(silentDb, { migrationsFolder: MIGRATIONS_PATH });
	await silentClient.end();
	await db
		.insert(user)
		.values([
			{
				id: TEST_USER_ID,
				name: "Test User",
				email: "test@example.com",
				emailVerified: false,
				image: null,
			},
			{
				id: TEST_USER_ID_2,
				name: "Other User",
				email: "other@example.com",
				emailVerified: false,
				image: null,
			},
		])
		.onConflictDoNothing();
}

export const TEST_SESSION_TOKEN = "test-session-token-abc123";

export async function createTestSession(userId = TEST_USER_ID) {
	await db
		.insert(session)
		.values({
			id: `session-${userId}`,
			userId,
			token: userId === TEST_USER_ID ? TEST_SESSION_TOKEN : `token-${userId}`,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoNothing();
}

export async function teardownTestDb() {
	await db.execute(
		sql`TRUNCATE TABLE urls, verification, account, session, "user" CASCADE`,
	);
}

export async function cleanupUrls() {
	await db.execute(sql`TRUNCATE TABLE urls CASCADE`);
}
