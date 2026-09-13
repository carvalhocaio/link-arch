import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { urls } from "../../lib/db/schema";
import {
	UrlKeyAlreadyExistsError,
	createShortUrl,
	deactivateExpiredUrls,
	findByKey,
	getUrlsByUserId,
	incrementClicks,
	patchUrlByIdAndUserId,
	softDeleteUrlByIdAndUserId,
} from "../../lib/services/url.service";
import {
	TEST_USER_ID,
	TEST_USER_ID_2,
	cleanupUrls,
	setupTestDb,
	teardownTestDb,
} from "../helpers/db";

beforeAll(setupTestDb);
afterAll(teardownTestDb);
afterEach(cleanupUrls);

describe("createShortUrl", () => {
	it("creates a URL with an auto-generated key", async () => {
		const result = await createShortUrl("https://example.com", TEST_USER_ID);
		expect(result.key).toHaveLength(7);
		expect(result.targetUrl).toBe("https://example.com");
		expect(result.userId).toBe(TEST_USER_ID);
		expect(result.isActive).toBe(true);
		expect(result.isDeleted).toBe(false);
	});

	it("creates a URL with a custom key", async () => {
		const result = await createShortUrl("https://example.com", TEST_USER_ID, "my-link");
		expect(result.key).toBe("my-link");
	});

	it("throws UrlKeyAlreadyExistsError for duplicate custom key", async () => {
		await createShortUrl("https://example.com", TEST_USER_ID, "duplicate");
		expect(createShortUrl("https://example.com", TEST_USER_ID, "duplicate")).rejects.toThrow(
			UrlKeyAlreadyExistsError,
		);
	});

	it("initializes clicks at 0", async () => {
		const result = await createShortUrl("https://example.com", TEST_USER_ID);
		expect(result.clicks).toBe(0);
	});
});

describe("findByKey", () => {
	it("returns the URL for a valid key", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "findme");
		const found = await findByKey("findme");
		expect(found?.id).toBe(created.id);
	});

	it("returns undefined for a non-existent key", async () => {
		const found = await findByKey("doesnotexist");
		expect(found).toBeUndefined();
	});

	it("returns undefined for a soft-deleted URL", async () => {
		await createShortUrl("https://example.com", TEST_USER_ID, "deleted");
		const url = await findByKey("deleted");
		if (!url) throw new Error("URL not found");
		await softDeleteUrlByIdAndUserId(url.id, TEST_USER_ID);
		const found = await findByKey("deleted");
		expect(found).toBeUndefined();
	});

	it("returns undefined for an inactive URL", async () => {
		await createShortUrl("https://example.com", TEST_USER_ID, "inactive");
		const url = await findByKey("inactive");
		if (!url) throw new Error("URL not found");
		await patchUrlByIdAndUserId(url.id, TEST_USER_ID, { isActive: false });
		const found = await findByKey("inactive");
		expect(found).toBeUndefined();
	});
});

describe("incrementClicks", () => {
	it("increments the clicks counter by 1", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "clickme");
		await incrementClicks(created.id);
		const found = await findByKey("clickme");
		expect(found?.clicks).toBe(1);
	});

	it("increments multiple times correctly", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "multi");
		await incrementClicks(created.id);
		await incrementClicks(created.id);
		await incrementClicks(created.id);
		const found = await findByKey("multi");
		expect(found?.clicks).toBe(3);
	});
});

describe("getUrlsByUserId", () => {
	it("returns only the URLs belonging to the specified user", async () => {
		await createShortUrl("https://example.com", TEST_USER_ID, "user1-link");
		await createShortUrl("https://example.com", TEST_USER_ID_2, "user2-link");

		const urls = await getUrlsByUserId(TEST_USER_ID);
		expect(urls.every((u) => u.userId === TEST_USER_ID)).toBe(true);
	});

	it("excludes soft-deleted URLs", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "will-delete");
		await softDeleteUrlByIdAndUserId(created.id, TEST_USER_ID);
		const urls = await getUrlsByUserId(TEST_USER_ID);
		expect(urls.find((u) => u.key === "will-delete")).toBeUndefined();
	});

	it("returns URLs ordered by creation date descending", async () => {
		await createShortUrl("https://example.com", TEST_USER_ID, "first");
		await createShortUrl("https://example.com", TEST_USER_ID, "second");
		const urls = await getUrlsByUserId(TEST_USER_ID);
		if (urls.length >= 2) {
			expect(new Date(urls[0].createdAt) >= new Date(urls[1].createdAt)).toBe(true);
		}
	});
});

describe("softDeleteUrlByIdAndUserId", () => {
	it("marks the URL as deleted", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "to-delete");
		const result = await softDeleteUrlByIdAndUserId(created.id, TEST_USER_ID);
		expect(result?.isDeleted).toBe(true);
	});

	it("returns undefined when URL belongs to a different user (IDOR guard)", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "guarded");
		const result = await softDeleteUrlByIdAndUserId(created.id, TEST_USER_ID_2);
		expect(result).toBeUndefined();
	});
});

describe("patchUrlByIdAndUserId", () => {
	it("sets isActive to false", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "toggle");
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID, { isActive: false });
		expect(result?.isActive).toBe(false);
	});

	it("sets isActive to true", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "reactivate");
		await patchUrlByIdAndUserId(created.id, TEST_USER_ID, { isActive: false });
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID, { isActive: true });
		expect(result?.isActive).toBe(true);
	});

	it("returns undefined for another user's URL (IDOR guard)", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "status-guard");
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID_2, { isActive: false });
		expect(result).toBeUndefined();
	});

	it("updates the key", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "old-key");
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID, { key: "new-key" });
		expect(result?.key).toBe("new-key");
	});

	it("throws UrlKeyAlreadyExistsError when key is taken", async () => {
		const a = await createShortUrl("https://a.com", TEST_USER_ID, "key-a");
		await createShortUrl("https://b.com", TEST_USER_ID, "key-b");
		expect(patchUrlByIdAndUserId(a.id, TEST_USER_ID, { key: "key-b" })).rejects.toThrow(
			UrlKeyAlreadyExistsError,
		);
	});

	it("updates the target URL", async () => {
		const created = await createShortUrl("https://old.com", TEST_USER_ID, "update-url");
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID, {
			targetUrl: "https://new.com",
		});
		expect(result?.targetUrl).toBe("https://new.com");
	});

	it("sets expiresAt when provided", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "with-expiry");
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID, {
			expiresAt: "2099-12-31",
		});
		expect(result?.expiresAt).not.toBeNull();
	});

	it("clears expiresAt when null is passed", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "clear-expiry");
		await patchUrlByIdAndUserId(created.id, TEST_USER_ID, { expiresAt: "2099-12-31" });
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID, { expiresAt: null });
		expect(result?.expiresAt).toBeNull();
	});

	it("leaves omitted fields untouched", async () => {
		const created = await createShortUrl("https://keep.com", TEST_USER_ID, "keep-key");
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID, { isActive: false });
		expect(result?.targetUrl).toBe("https://keep.com");
		expect(result?.key).toBe("keep-key");
	});

	it("applies every field in a single call", async () => {
		const created = await createShortUrl("https://before.com", TEST_USER_ID, "multi-before");
		const result = await patchUrlByIdAndUserId(created.id, TEST_USER_ID, {
			targetUrl: "https://after.com",
			key: "multi-after",
			isActive: false,
			expiresAt: "2030-01-15",
		});
		expect(result?.targetUrl).toBe("https://after.com");
		expect(result?.key).toBe("multi-after");
		expect(result?.isActive).toBe(false);
		expect(result?.expiresAt?.toISOString()).toBe("2030-01-15T23:59:59.000Z");
	});
});

describe("deactivateExpiredUrls", () => {
	it("deactivates URLs past their expiry date", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "expired");
		// Set expiry in the past
		await patchUrlByIdAndUserId(created.id, TEST_USER_ID, { expiresAt: "2000-01-01" });
		await deactivateExpiredUrls();
		const found = await db.query.urls.findFirst({ where: eq(urls.key, "expired") });
		expect(found?.isActive).toBe(false);
	});

	it("does not deactivate URLs that have not expired yet", async () => {
		await createShortUrl("https://example.com", TEST_USER_ID, "future");
		const url = await findByKey("future");
		if (!url) throw new Error("URL not found");
		await patchUrlByIdAndUserId(url.id, TEST_USER_ID, { expiresAt: "2099-12-31" });
		await deactivateExpiredUrls();
		const found = await findByKey("future");
		expect(found?.isActive).toBe(true);
	});
});
