"use client";

import Link from "next/link";

export function AuthLegalFooter() {
	return (
		<div className="text-center text-xs text-muted-foreground">
			<p>
				&copy; {new Date().getFullYear()} Link Arch. Built by{" "}
				<a
					href="https://github.com/carvalhocaio"
					target="_blank"
					rel="noopener noreferrer"
					className="font-medium text-foreground underline-offset-4 hover:underline"
				>
					Caio Carvalho
				</a>
				.
			</p>
			<div className="mt-2 flex items-center justify-center gap-4">
				<Link href="/privacy" className="hover:text-foreground">
					Privacy
				</Link>
				<Link href="/terms" className="hover:text-foreground">
					Terms
				</Link>
			</div>
		</div>
	);
}
