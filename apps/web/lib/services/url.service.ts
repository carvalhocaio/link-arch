import { db } from "@/lib/db";
import { urls } from "@/lib/db/schema";
import { and, desc, eq, gt, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { generateKey } from "./keygen";

const RANDOM_KEY_MAX_ATTEMPTS = 5;

export class UrlKeyAlreadyExistsError extends Error {
	constructor() {
		super("Custom URL key is already in use");
		this.name = "UrlKeyAlreadyExistsError";
	}
}

export async function createShortUrl(targetUrl: string, userId: string, customKey?: string) {
	if (customKey) {
		try {
			const [inserted] = await db
				.insert(urls)
				.values({ key: customKey, targetUrl, userId })
				.returning();

			return inserted;
		} catch (error) {
			if (isUrlKeyUniqueViolation(error)) {
				throw new UrlKeyAlreadyExistsError();
			}

			throw error;
		}
	}

	for (let attempt = 0; attempt < RANDOM_KEY_MAX_ATTEMPTS; attempt += 1) {
		const key = generateKey();

		try {
			const [inserted] = await db.insert(urls).values({ key, targetUrl, userId }).returning();
			return inserted;
		} catch (error) {
			if (isUrlKeyUniqueViolation(error)) {
				continue;
			}

			throw error;
		}
	}

	throw new Error("Failed to generate a unique URL key");
}

export async function findByKey(key: string) {
	return db.query.urls.findFirst({
		where: and(
			eq(urls.key, key),
			eq(urls.isDeleted, false),
			eq(urls.isActive, true),
			or(isNull(urls.expiresAt), gt(urls.expiresAt, new Date())),
		),
	});
}

export async function incrementClicks(id: number) {
	await db
		.update(urls)
		.set({
			clicks: sql`${urls.clicks} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(urls.id, id));
}

export async function getUrlsByUserId(userId: string) {
	await deactivateExpiredUrls();

	return db
		.select()
		.from(urls)
		.where(and(eq(urls.userId, userId), eq(urls.isDeleted, false)))
		.orderBy(desc(urls.createdAt));
}

export async function deactivateExpiredUrls() {
	await db
		.update(urls)
		.set({ isActive: false, updatedAt: new Date() })
		.where(
			and(
				eq(urls.isDeleted, false),
				eq(urls.isActive, true),
				isNotNull(urls.expiresAt),
				lte(urls.expiresAt, new Date()),
			),
		);
}

export async function softDeleteUrlByIdAndUserId(id: number, userId: string) {
	const [updated] = await db
		.update(urls)
		.set({ isDeleted: true, updatedAt: new Date() })
		.where(and(eq(urls.id, id), eq(urls.userId, userId), eq(urls.isDeleted, false)))
		.returning();

	return updated;
}

export interface UrlPatch {
	targetUrl?: string;
	expiresAt?: string | null;
	key?: string;
	isActive?: boolean;
}

/**
 * Applies every changed field of a link in a single UPDATE. The edit dialog can
 * change the destination, the expiry, the key and the active flag at once, and
 * issuing one statement keeps that a single round-trip instead of three.
 */
export async function patchUrlByIdAndUserId(id: number, userId: string, patch: UrlPatch) {
	const values: Record<string, unknown> = { updatedAt: new Date() };

	if (patch.targetUrl !== undefined) values.targetUrl = patch.targetUrl;
	if (patch.expiresAt !== undefined) values.expiresAt = parseExpiryDate(patch.expiresAt);
	if (patch.key !== undefined) values.key = patch.key;
	if (patch.isActive !== undefined) values.isActive = patch.isActive;

	try {
		const [updated] = await db
			.update(urls)
			.set(values)
			.where(and(eq(urls.id, id), eq(urls.userId, userId), eq(urls.isDeleted, false)))
			.returning();

		return updated;
	} catch (error) {
		if (isUrlKeyUniqueViolation(error)) {
			throw new UrlKeyAlreadyExistsError();
		}

		throw error;
	}
}

function parseExpiryDate(expiresAt: string | null) {
	if (expiresAt === null) {
		return null;
	}

	const [year, month, day] = expiresAt.split("-").map(Number);
	if (!year || !month || !day) {
		return null;
	}

	return new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
}

function isUrlKeyUniqueViolation(error: unknown): boolean {
	if (!error || typeof error !== "object") {
		return false;
	}

	const code = "code" in error ? String((error as { code?: unknown }).code) : "";
	const constraint =
		"constraint" in error ? String((error as { constraint?: unknown }).constraint) : "";

	return code === "23505" && (constraint === "" || constraint === "urls_key_active_unique");
}
