import type { AdminUrl } from "@/lib/api";
import { SITE_URL } from "@/lib/site";

export interface ActivityItem {
	id: number;
	key: string;
	slug: string;
	targetUrl: string;
	destination: string;
	clicks: number;
	favicon: string | null;
}

export function toActivityItems(urls: AdminUrl[]): ActivityItem[] {
	return urls.map((url) => {
		const parsed = safeParseUrl(url.targetUrl);

		return {
			id: url.id,
			key: url.key,
			slug: `/${url.key}`,
			targetUrl: url.targetUrl,
			destination: stripProtocol(url.targetUrl),
			clicks: url.clicks,
			favicon: parsed ? `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64` : null,
		};
	});
}

function baseUrl() {
	return typeof window !== "undefined" ? window.location.origin : SITE_URL;
}

export function toShortUrl(key: string) {
	return `${baseUrl()}/${key}`;
}

/**
 * Host shown next to a short key in the UI. Derived from the same origin as
 * `toShortUrl` so the displayed host and the copied link never disagree.
 */
export function shortHost() {
	return stripProtocol(baseUrl());
}

function safeParseUrl(value: string): URL | null {
	try {
		return new URL(value);
	} catch {
		return null;
	}
}

function stripProtocol(value: string) {
	return value.replace(/^https?:\/\//, "");
}
