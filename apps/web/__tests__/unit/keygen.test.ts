import { describe, expect, it } from "bun:test";
import {
	generateKey,
	getCustomKeyValidationError,
	normalizeCustomKey,
} from "../../lib/services/keygen";

const BASE62 = /^[0-9a-zA-Z]+$/;

describe("generateKey", () => {
	it("returns a 7-character string", () => {
		expect(generateKey()).toHaveLength(7);
	});

	it("uses only base62 characters", () => {
		for (let i = 0; i < 20; i++) {
			expect(BASE62.test(generateKey())).toBe(true);
		}
	});

	it("generates unique keys", () => {
		const keys = new Set(Array.from({ length: 100 }, generateKey));
		expect(keys.size).toBeGreaterThan(90);
	});
});

describe("normalizeCustomKey", () => {
	it("trims leading and trailing whitespace", () => {
		expect(normalizeCustomKey("  hello  ")).toBe("hello");
	});

	it("lowercases the value", () => {
		expect(normalizeCustomKey("MyLink")).toBe("mylink");
	});

	it("trims and lowercases together", () => {
		expect(normalizeCustomKey("  MyLink  ")).toBe("mylink");
	});
});

describe("getCustomKeyValidationError", () => {
	it("returns error for empty key", () => {
		expect(getCustomKeyValidationError("")).not.toBeNull();
	});

	it("returns error for key shorter than 3 characters", () => {
		expect(getCustomKeyValidationError("ab")).not.toBeNull();
	});

	it("returns error for key longer than 32 characters", () => {
		expect(getCustomKeyValidationError("a".repeat(33))).not.toBeNull();
	});

	it("returns error for uppercase letters", () => {
		expect(getCustomKeyValidationError("MyLink")).not.toBeNull();
	});

	it("returns error for special characters", () => {
		expect(getCustomKeyValidationError("my_link")).not.toBeNull();
		expect(getCustomKeyValidationError("my.link")).not.toBeNull();
		expect(getCustomKeyValidationError("my link")).not.toBeNull();
	});

	it("returns error for reserved keys", () => {
		expect(getCustomKeyValidationError("api")).not.toBeNull();
		expect(getCustomKeyValidationError("health")).not.toBeNull();
		expect(getCustomKeyValidationError("openapi")).not.toBeNull();
	});

	it("returns null for valid key with letters only", () => {
		expect(getCustomKeyValidationError("mylink")).toBeNull();
	});

	it("returns null for valid key with numbers", () => {
		expect(getCustomKeyValidationError("my-link-123")).toBeNull();
	});

	it("returns null for valid key with hyphens", () => {
		expect(getCustomKeyValidationError("my-link")).toBeNull();
	});

	it("returns null for 3-character key (minimum)", () => {
		expect(getCustomKeyValidationError("abc")).toBeNull();
	});

	it("returns null for 32-character key (maximum)", () => {
		expect(getCustomKeyValidationError("a".repeat(32))).toBeNull();
	});
});
