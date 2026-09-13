import { type ActivityItem, shortHost, toShortUrl } from "@/lib/activity";
import type { AdminUrl } from "@/lib/api";
import { formatExpiryInBrowserTimezone } from "@/lib/expiry";

const HEADERS = [
	"Identity",
	"Destination",
	"Status",
	"Available Until (Browser TZ)",
	"Clicks",
	"Created At",
	"Short URL",
];

export function formatCreatedAt(value: string | undefined) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	}).format(date);
}

/**
 * Quoting alone stops field breakout but not formula injection: a cell starting
 * with = + - @ or a control character is evaluated by Excel and Sheets. Today's
 * columns derive from hostnames and validated keys, so neither can lead with one
 * — the prefix is here so a future free-text column cannot reopen it.
 */
function toCsvCell(value: string) {
	const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
	return `"${safe.replaceAll('"', '""')}"`;
}

export function buildLinksCsv(activities: ActivityItem[], urlsById: Map<number, AdminUrl>) {
	const host = shortHost();

	const lines = activities.map((activity) => {
		const meta = urlsById.get(activity.id);

		return [
			`${host}${activity.slug}`,
			activity.destination,
			(meta?.isActive ?? true) ? "Active" : "Inactive",
			formatExpiryInBrowserTimezone(meta?.expiresAt) ?? "-",
			String(activity.clicks),
			formatCreatedAt(meta?.createdAt),
			toShortUrl(activity.key),
		]
			.map(toCsvCell)
			.join(",");
	});

	return [HEADERS.join(","), ...lines].join("\n");
}

export function downloadCsv(csv: string, filename: string) {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const downloadUrl = URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	anchor.href = downloadUrl;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(downloadUrl);
}
