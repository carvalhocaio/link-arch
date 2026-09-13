import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Not found",
	robots: { index: false, follow: false },
};

export default function NotFound() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
			<p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
				404
			</p>
			<h1 className="text-2xl font-semibold tracking-tight">This link doesn&apos;t exist</h1>
			<p className="max-w-sm text-xs text-muted-foreground">
				The short link you followed is inactive, expired, or was never created.
			</p>
			<Link href="/" className={buttonVariants()}>
				Back to home
			</Link>
		</main>
	);
}
