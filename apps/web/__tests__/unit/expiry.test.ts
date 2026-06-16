import { describe, expect, it } from "bun:test";
import {
	formatExpiryInBrowserTimezone,
	toDateInputValueFromUtc,
} from "../../lib/expiry";

describe("toDateInputValueFromUtc", () => {
	it("returns empty string for null", () => {
		expect(toDateInputValueFromUtc(null)).toBe("");
	});

	it("returns empty string for undefined", () => {
		expect(toDateInputValueFromUtc(undefined)).toBe("");
	});

	it("returns empty string for empty string", () => {
		expect(toDateInputValueFromUtc("")).toBe("");
	});

	it("returns empty string for invalid date string", () => {
		expect(toDateInputValueFromUtc("not-a-date")).toBe("");
	});

	it("formats a valid ISO date string as YYYY-MM-DD using UTC", () => {
		expect(toDateInputValueFromUtc("2025-06-15T23:59:59.000Z")).toBe(
			"2025-06-15",
		);
	});

	it("pads single-digit month and day with zeros", () => {
		expect(toDateInputValueFromUtc("2025-01-05T00:00:00.000Z")).toBe(
			"2025-01-05",
		);
	});
});

describe("formatExpiryInBrowserTimezone", () => {
	it("returns null for null", () => {
		expect(formatExpiryInBrowserTimezone(null)).toBeNull();
	});

	it("returns null for undefined", () => {
		expect(formatExpiryInBrowserTimezone(undefined)).toBeNull();
	});

	it("returns null for empty string", () => {
		expect(formatExpiryInBrowserTimezone("")).toBeNull();
	});

	it("returns null for invalid date string", () => {
		expect(formatExpiryInBrowserTimezone("not-a-date")).toBeNull();
	});

	it("returns a non-empty formatted string for a valid date", () => {
		const result = formatExpiryInBrowserTimezone("2025-12-31T23:59:59.000Z");
		expect(result).not.toBeNull();
		expect(typeof result).toBe("string");
		expect((result as string).length).toBeGreaterThan(0);
	});
});
