import type { Metadata } from "next";

import { DashboardView } from "@/app/dashboard/dashboard-view";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Shorten a new link and review your most recent short links.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <DashboardView />;
}
