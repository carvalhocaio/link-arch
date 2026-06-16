import { describe, expect, it, mock } from "bun:test";

mock.module("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: () => Promise.resolve(null),
		},
	},
}));

const { POST: postShorten } = await import("../../app/api/shorten/route");
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

function makeParams(id: string) {
	return { params: Promise.resolve({ id }) };
}

describe("Unauthenticated requests return 401", () => {
	it("POST /api/shorten", async () => {
		const req = new Request("http://localhost/api/shorten", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url: "https://example.com" }),
		});
		const res = await postShorten(req);
		expect(res.status).toBe(401);
	});

	it("GET /api/admin/urls", async () => {
		const req = new Request("http://localhost/api/admin/urls");
		const res = await getAdminUrls(req);
		expect(res.status).toBe(401);
	});

	it("PATCH /api/admin/urls/:id", async () => {
		const req = new Request("http://localhost/api/admin/urls/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url: "https://example.com" }),
		});
		const res = await patchUrl(req, makeParams("1"));
		expect(res.status).toBe(401);
	});

	it("DELETE /api/admin/urls/:id", async () => {
		const req = new Request("http://localhost/api/admin/urls/1", {
			method: "DELETE",
		});
		const res = await deleteUrl(req, makeParams("1"));
		expect(res.status).toBe(401);
	});

	it("PATCH /api/admin/urls/:id/status", async () => {
		const req = new Request("http://localhost/api/admin/urls/1/status", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ isActive: false }),
		});
		const res = await patchStatus(req, makeParams("1"));
		expect(res.status).toBe(401);
	});

	it("PATCH /api/admin/urls/:id/key", async () => {
		const req = new Request("http://localhost/api/admin/urls/1/key", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ key: "new-key" }),
		});
		const res = await patchKey(req, makeParams("1"));
		expect(res.status).toBe(401);
	});
});
