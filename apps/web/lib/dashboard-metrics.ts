import type { AdminUrl } from "@/lib/api";

type StatTone = "positive" | "neutral" | "featured";

export interface DashboardQuickStat {
	title: string;
	value: string;
	detail: string;
	tone: StatTone;
}

export function buildQuickStats(urls: AdminUrl[], now = new Date()): DashboardQuickStat[] {
	const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
	const activeLinks = urls.filter((url) => url.isActive).length;
	const scheduledForExpiry = urls.filter((url) => Boolean(url.expiresAt)).length;

	const topPerforming = [...urls].sort((a, b) => b.clicks - a.clicks)[0] ?? null;

	const currentMonthClicks = urls.reduce((sum, url) => {
		if (!isInMonth(url.createdAt, now)) {
			return sum;
		}

		return sum + url.clicks;
	}, 0);

	const previousMonth = getPreviousMonth(now);
	const previousMonthClicks = urls.reduce((sum, url) => {
		if (!isInMonth(url.createdAt, previousMonth)) {
			return sum;
		}

		return sum + url.clicks;
	}, 0);

	return [
		{
			title: "Total Clicks",
			value: totalClicks.toLocaleString(),
			detail: buildMonthlyDetail(currentMonthClicks, previousMonthClicks),
			tone: "positive",
		},
		{
			title: "Active Links",
			value: activeLinks.toLocaleString(),
			detail: `${scheduledForExpiry.toLocaleString()} scheduled for expiry`,
			tone: "neutral",
		},
		{
			title: "Top Performing",
			value: topPerforming ? `/${topPerforming.key}` : "-",
			detail: topPerforming ? `${topPerforming.clicks.toLocaleString()} clicks` : "No links yet",
			tone: "featured",
		},
	];
}

function buildMonthlyDetail(currentMonthClicks: number, previousMonthClicks: number) {
	if (currentMonthClicks === 0 && previousMonthClicks === 0) {
		return "No change from last month";
	}

	if (previousMonthClicks === 0) {
		return "+100.0% from last month";
	}

	const change = ((currentMonthClicks - previousMonthClicks) / previousMonthClicks) * 100;
	const sign = change >= 0 ? "+" : "";

	return `${sign}${change.toFixed(1)}% from last month`;
}

function isInMonth(value: string, reference: Date) {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return false;
	}

	return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
}

function getPreviousMonth(now: Date) {
	return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}
