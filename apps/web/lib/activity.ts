import type { AdminUrl } from "@/lib/api";

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

export function toShortUrl(key: string) {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
	return `${baseUrl}/${key}`;
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
