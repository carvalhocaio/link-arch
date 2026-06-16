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
	TEST_USER_ID_2,
	cleanupUrls,
	setupTestDb,
	teardownTestDb,
} from "../helpers/db";
import { createShortUrl } from "../../lib/services/url.service";

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
const { PATCH: patchUrl, DELETE: deleteUrl } = await import(
	"../../app/api/admin/urls/[id]/route"
);
const { PATCH: patchStatus } = await import(
	"../../app/api/admin/urls/[id]/status/route"
);
const { PATCH: patchKey } = await import(
	"../../app/api/admin/urls/[id]/key/route"
);

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
		const created = await createShortUrl(
			"https://example.com",
			TEST_USER_ID,
			"todelete",
		);
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
		const created = await createShortUrl(
			"https://example.com",
			TEST_USER_ID,
			"idor-delete",
		);
		const req = new Request(`http://localhost/api/admin/urls/${created.id}`, {
			method: "DELETE",
		});
		const res = await deleteUrl(req, makeParams(created.id));
		expect(res.status).toBe(404);
	});
});

describe("PATCH /api/admin/urls/:id/status", () => {
	it("toggles isActive to false", async () => {
		authState.session = session1;
		const created = await createShortUrl(
			"https://example.com",
			TEST_USER_ID,
			"toggle-status",
		);
		const req = new Request(
			`http://localhost/api/admin/urls/${created.id}/status`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isActive: false }),
			},
		);
		const res = await patchStatus(req, makeParams(created.id));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.isActive).toBe(false);
	});

	it("returns 404 when patching another user's URL status (IDOR guard)", async () => {
		authState.session = session2;
		const created = await createShortUrl(
			"https://example.com",
			TEST_USER_ID,
			"idor-status",
		);
		const req = new Request(
			`http://localhost/api/admin/urls/${created.id}/status`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isActive: false }),
			},
		);
		const res = await patchStatus(req, makeParams(created.id));
		expect(res.status).toBe(404);
	});
});

describe("PATCH /api/admin/urls/:id/key", () => {
	it("updates the key", async () => {
		authState.session = session1;
		const created = await createShortUrl(
			"https://example.com",
			TEST_USER_ID,
			"old-admin-key",
		);
		const req = new Request(
			`http://localhost/api/admin/urls/${created.id}/key`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: "new-admin-key" }),
			},
		);
		const res = await patchKey(req, makeParams(created.id));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.key).toBe("new-admin-key");
	});

	it("returns 400 for an invalid key", async () => {
		authState.session = session1;
		const created = await createShortUrl(
			"https://example.com",
			TEST_USER_ID,
			"valid-key",
		);
		const req = new Request(
			`http://localhost/api/admin/urls/${created.id}/key`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: "API" }),
			},
		);
		const res = await patchKey(req, makeParams(created.id));
		expect(res.status).toBe(400);
	});

	it("returns 409 when key is already taken", async () => {
		authState.session = session1;
		const a = await createShortUrl("https://a.com", TEST_USER_ID, "key-taken-a");
		await createShortUrl("https://b.com", TEST_USER_ID, "key-taken-b");
		const req = new Request(
			`http://localhost/api/admin/urls/${a.id}/key`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key: "key-taken-b" }),
			},
		);
		const res = await patchKey(req, makeParams(a.id));
		expect(res.status).toBe(409);
	});
});
