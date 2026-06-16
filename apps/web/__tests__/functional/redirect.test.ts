import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	mock,
} from "bun:test";
import {
	TEST_USER_ID,
	cleanupUrls,
	setupTestDb,
	teardownTestDb,
} from "../helpers/db";
import { createShortUrl, updateUrlByIdAndUserId } from "../../lib/services/url.service";

mock.module("@/lib/auth", () => ({
	auth: { api: { getSession: () => Promise.resolve(null) } },
}));

const { GET } = await import("../../app/[key]/route");

function redirectRequest(key: string) {
	return new Request(`http://localhost/${key}`);
}

function makeParams(key: string) {
	return { params: Promise.resolve({ key }) };
}

beforeAll(setupTestDb);
afterAll(teardownTestDb);
afterEach(cleanupUrls);

describe("GET /:key (redirect)", () => {
	it("returns 302 and sets Location for an active URL", async () => {
		await createShortUrl("https://target.example.com/path", TEST_USER_ID, "redir");
		const res = await GET(redirectRequest("redir"), makeParams("redir"));
		expect(res.status).toBe(302);
		// Use a path URL to avoid URL normalization adding a trailing slash to the root
		expect(res.headers.get("Location")).toBe("https://target.example.com/path");
	});

	it("returns 404 for a non-existent key", async () => {
		const res = await GET(
			redirectRequest("nonexistent"),
			makeParams("nonexistent"),
		);
		expect(res.status).toBe(404);
	});

	it("returns 404 for an inactive URL", async () => {
		const created = await createShortUrl(
			"https://example.com",
			TEST_USER_ID,
			"inactive",
		);
		await updateUrlByIdAndUserId(
			created.id,
			TEST_USER_ID,
			"https://example.com",
			"2000-01-01",
		);
		// expired URLs are filtered inline in findByKey (expiresAt check in WHERE clause)
		const res = await GET(redirectRequest("inactive"), makeParams("inactive"));
		expect(res.status).toBe(404);
	});
});
