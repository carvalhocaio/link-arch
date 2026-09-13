import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const fontMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

const SITE_DESCRIPTION = "Digital infrastructure URL management and short links.";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "LinkArch",
		template: "%s · LinkArch",
	},
	description: SITE_DESCRIPTION,
	applicationName: "LinkArch",
	icons: {
		icon: "/images/linkarch-icon.svg",
		shortcut: "/images/linkarch-icon.svg",
		apple: "/images/linkarch-icon.svg",
	},
	openGraph: {
		type: "website",
		siteName: "LinkArch",
		title: "LinkArch",
		description: SITE_DESCRIPTION,
		url: SITE_URL,
	},
	twitter: {
		card: "summary",
		title: "LinkArch",
		description: SITE_DESCRIPTION,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={cn("antialiased", fontMono.variable)}>
			<body>
				<ThemeProvider>
					<QueryProvider>
						<TooltipProvider>{children}</TooltipProvider>
						<Toaster position="bottom-right" />
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
