"use client";

import { type ActivityItem, shortHost, toShortUrl } from "@/lib/activity";

export function LinkStatusBadge({ isActive }: { isActive: boolean }) {
	return (
		<span
			className={`inline-flex shrink-0 px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
				isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
			}`}
		>
			{isActive ? "Active" : "Inactive"}
		</span>
	);
}

/** The short link itself, opening the real short URL in a new tab. */
export function ShortKeyLink({ activity }: { activity: ActivityItem }) {
	return (
		<a
			href={toShortUrl(activity.key)}
			target="_blank"
			rel="noopener noreferrer"
			className="truncate text-xs font-semibold underline-offset-4 transition-colors hover:text-primary-ink hover:underline"
		>
			{`${shortHost()}${activity.slug}`}
		</a>
	);
}
