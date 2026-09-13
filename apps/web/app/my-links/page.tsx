import type { Metadata } from "next";

import { MyLinksView } from "@/app/my-links/my-links-view";

export const metadata: Metadata = {
	title: "My Links",
	description: "Manage and monitor your short links.",
	robots: { index: false, follow: false },
};

export default function Page() {
	return <MyLinksView />;
}
