import { describe, expect, it } from "bun:test";
import { GET } from "../../app/api/health/route";

describe("GET /api/health", () => {
	it("returns 200", async () => {
		const req = new Request("http://localhost/api/health");
		const res = await GET();
		expect(res.status).toBe(200);
	});

	it("returns JSON with expected shape", async () => {
		const res = await GET();
		const body = await res.json();
		expect(body).toHaveProperty("title");
		expect(body).toHaveProperty("version");
		expect(body).toHaveProperty("description");
		expect(body).toHaveProperty("author");
		expect(body).toHaveProperty("repository");
	});

	it("returns the correct title", async () => {
		const res = await GET();
		const body = await res.json();
		expect(body.title).toBe("Link Arch");
	});

	it("returns a semver-like version string", async () => {
		const res = await GET();
		const body = await res.json();
		expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
	});
});
