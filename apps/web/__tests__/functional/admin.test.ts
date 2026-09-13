import { afterAll, afterEach, beforeAll, describe, expect, it, mock } from "bun:test";
import { createShortUrl } from "../../lib/services/url.service";
import {
	TEST_USER_ID,
	TEST_USER_ID_2,
	cleanupUrls,
	setupTestDb,
	teardownTestDb,
} from "../helpers/db";

const authState: { session: object | null } = { session: null };

mock.module("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: () => Promise.resolve(authState.session),
		},
	},
}));

mock.module("@/lib/services/validator", () => ({
	isUrlReachable: () => Promise.resolve(true),
}));

const { GET: getAdminUrls } = await import("../../app/api/admin/urls/route");
const { PATCH: patchUrl, DELETE: deleteUrl } = await import("../../app/api/admin/urls/[id]/route");

const session1 = { user: { id: TEST_USER_ID, email: "test@example.com" } };
const session2 = { user: { id: TEST_USER_ID_2, email: "other@example.com" } };

function makeParams(id: string | number) {
	return { params: Promise.resolve({ id: String(id) }) };
}

beforeAll(setupTestDb);
afterAll(teardownTestDb);
afterEach(() => {
	authState.session = null;
});
afterEach(cleanupUrls);

describe("GET /api/admin/urls", () => {
	it("returns only the authenticated user's URLs", async () => {
		authState.session = session1;
		await createShortUrl("https://user1.com", TEST_USER_ID, "u1link");
		await createShortUrl("https://user2.com", TEST_USER_ID_2, "u2link");

		const req = new Request("http://localhost/api/admin/urls");
		const res = await getAdminUrls(req);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(Array.isArray(body)).toBe(true);
		expect(body).toHaveLength(1);
		expect(body.find((u: { key: string }) => u.key === "u2link")).toBeUndefined();
	});

	it("returns an empty array when user has no links", async () => {
		authState.session = session1;
		const req = new Request("http://localhost/api/admin/urls");
		const res = await getAdminUrls(req);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual([]);
	});
});

describe("DELETE /api/admin/urls/:id", () => {
	it("soft-deletes a URL owned by the user", async () => {
		authState.session = session1;
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "todelete");
		const req = new Request(`http://localhost/api/admin/urls/${created.id}`, {
			method: "DELETE",
		});
		const res = await deleteUrl(req, makeParams(created.id));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.deleted.id).toBe(created.id);
	});

	it("returns 404 when trying to delete another user's URL (IDOR guard)", async () => {
		authState.session = session2;
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "idor-delete");
		const req = new Request(`http://localhost/api/admin/urls/${created.id}`, {
			method: "DELETE",
		});
		const res = await deleteUrl(req, makeParams(created.id));
		expect(res.status).toBe(404);
	});
});

describe("PATCH /api/admin/urls/:id (consolidated)", () => {
	function patchRequest(id: number, body: Record<string, unknown>) {
		return new Request(`http://localhost/api/admin/urls/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
	}

	it("applies url, expiry, key and status in a single request", async () => {
		authState.session = session1;
		const created = await createShortUrl("https://before.com", TEST_USER_ID, "before-key");

		const res = await patchUrl(
			patchRequest(created.id, {
				url: "https://after.com",
				expiresAt: "2030-01-15",
				key: "after-key",
				isActive: false,
			}),
			makeParams(created.id),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.targetUrl).toBe("https://after.com");
		expect(body.key).toBe("after-key");
		expect(body.isActive).toBe(false);
		expect(new Date(body.expiresAt).toISOString()).toBe("2030-01-15T23:59:59.000Z");
	});

	it("leaves omitted fields untouched", async () => {
		authState.session = session1;
		const created = await createShortUrl("https://keep.com", TEST_USER_ID, "keep-key");

		const res = await patchUrl(
			patchRequest(created.id, { isActive: false }),
			makeParams(created.id),
		);

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.isActive).toBe(false);
		expect(body.targetUrl).toBe("https://keep.com");
		expect(body.key).toBe("keep-key");
	});

	it("returns 400 for an invalid key", async () => {
		authState.session = session1;
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "patch-valid");

		const res = await patchUrl(patchRequest(created.id, { key: "API" }), makeParams(created.id));
		expect(res.status).toBe(400);
	});

	it("returns 409 when the new key is already taken", async () => {
		authState.session = session1;
		const a = await createShortUrl("https://a.com", TEST_USER_ID, "patch-taken-a");
		await createShortUrl("https://b.com", TEST_USER_ID, "patch-taken-b");

		const res = await patchUrl(patchRequest(a.id, { key: "patch-taken-b" }), makeParams(a.id));
		expect(res.status).toBe(409);
	});

	it("returns 401 without a session", async () => {
		const created = await createShortUrl("https://example.com", TEST_USER_ID, "patch-noauth");

		const res = await patchUrl(
			patchRequest(created.id, { isActive: false }),
			makeParams(created.id),
		);
		expect(res.status).toBe(401);
	});

	describe("input validation", () => {
		it.each([
			["isActive as a string", "bad-active-str", { isActive: "false" }],
			["isActive as an object", "bad-active-obj", { isActive: {} }],
			["expiresAt as a number", "bad-expiry-num", { expiresAt: 12345 }],
			["key as a number", "bad-key-num", { key: 42 }],
			["url as an object", "bad-url-obj", { url: { href: "https://x.com" } }],
		])("returns 400 for %s instead of throwing", async (_label, key, body) => {
			authState.session = session1;
			const created = await createShortUrl("https://example.com", TEST_USER_ID, key);

			const res = await patchUrl(patchRequest(created.id, body), makeParams(created.id));
			expect(res.status).toBe(400);
		});

		it("returns 400 for a non-numeric id", async () => {
			authState.session = session1;

			const req = new Request("http://localhost/api/admin/urls/abc", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isActive: false }),
			});
			const res = await patchUrl(req, makeParams("abc"));
			expect(res.status).toBe(400);
		});

		it("accepts null expiresAt as a clear", async () => {
			authState.session = session1;
			const created = await createShortUrl("https://example.com", TEST_USER_ID, "patch-null-exp");

			const res = await patchUrl(
				patchRequest(created.id, { expiresAt: null }),
				makeParams(created.id),
			);
			expect(res.status).toBe(200);
			expect((await res.json()).expiresAt).toBeNull();
		});
	});
});

describe("DELETE /api/admin/urls/:id input validation", () => {
	it("returns 400 for a non-numeric id", async () => {
		authState.session = session1;

		const req = new Request("http://localhost/api/admin/urls/not-a-number", { method: "DELETE" });
		const res = await deleteUrl(req, makeParams("not-a-number"));
		expect(res.status).toBe(400);
	});
});
