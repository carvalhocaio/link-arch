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

const { POST } = await import("../../app/api/shorten/route");

const mockSession = { user: { id: TEST_USER_ID, email: "test@example.com" } };

function shortenRequest(body: object) {
	return new Request("http://localhost/api/shorten", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

beforeAll(setupTestDb);
afterAll(teardownTestDb);
afterEach(() => {
	authState.session = null;
});
afterEach(cleanupUrls);

describe("POST /api/shorten", () => {
	it("returns 401 when not authenticated", async () => {
		authState.session = null;
		const res = await POST(shortenRequest({ url: "https://example.com" }));
		expect(res.status).toBe(401);
	});

	it("creates a short URL and returns the expected shape", async () => {
		authState.session = mockSession;
		const res = await POST(shortenRequest({ url: "https://example.com" }));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toHaveProperty("shortUrl");
		expect(body).toHaveProperty("key");
		expect(body).toHaveProperty("targetUrl", "https://example.com");
		expect(body).toHaveProperty("createdAt");
	});

	it("uses a custom key when provided", async () => {
		authState.session = mockSession;
		const res = await POST(
			shortenRequest({ url: "https://example.com", key: "my-custom" }),
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.key).toBe("my-custom");
	});

	it("returns 400 for a reserved custom key", async () => {
		authState.session = mockSession;
		const res = await POST(
			shortenRequest({ url: "https://example.com", key: "api" }),
		);
		expect(res.status).toBe(400);
	});

	it("normalizes uppercase key to lowercase and accepts it", async () => {
		authState.session = mockSession;
		// normalizeCustomKey("MyLink") → "mylink", which is valid
		const res = await POST(
			shortenRequest({ url: "https://example.com", key: "MyLink" }),
		);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.key).toBe("mylink");
	});

	it("returns 400 for an invalid custom key (special characters)", async () => {
		authState.session = mockSession;
		const res = await POST(
			shortenRequest({ url: "https://example.com", key: "my_link!" }),
		);
		expect(res.status).toBe(400);
	});

	it("returns 400 for an invalid custom key (too short)", async () => {
		authState.session = mockSession;
		const res = await POST(
			shortenRequest({ url: "https://example.com", key: "ab" }),
		);
		expect(res.status).toBe(400);
	});

	it("returns 409 when the custom key already exists", async () => {
		authState.session = mockSession;
		await POST(shortenRequest({ url: "https://example.com", key: "taken" }));
		const res = await POST(
			shortenRequest({ url: "https://other.com", key: "taken" }),
		);
		expect(res.status).toBe(409);
	});

	it("returns 400 when URL is not reachable", async () => {
		authState.session = mockSession;
		mock.module("@/lib/services/validator", () => ({
			isUrlReachable: () => Promise.resolve(false),
		}));
		try {
			const res = await POST(
				shortenRequest({ url: "https://unreachable.invalid" }),
			);
			expect(res.status).toBe(400);
		} finally {
			mock.module("@/lib/services/validator", () => ({
				isUrlReachable: () => Promise.resolve(true),
			}));
		}
	});
});
