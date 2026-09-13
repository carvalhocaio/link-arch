import Link from "next/link";
import type { ReactNode } from "react";

interface LegalPageLayoutProps {
	title: string;
	lastUpdated: string;
	children: ReactNode;
}

/** Shared chrome for the privacy and terms pages. */
export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
	return (
		<div className="min-h-svh bg-background">
			<main id="main-content" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 md:py-16">
				<div className="mb-6">
					<Link
						href="/"
						className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary-ink"
					>
						&larr; Back
					</Link>
				</div>

				<article className="space-y-8">
					<header className="space-y-2 border-b border-border pb-5">
						<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
						<p className="text-[11px] text-muted-foreground">Last updated: {lastUpdated}</p>
					</header>

					{children}

					<section className="space-y-3 border-t border-border pt-6">
						<h2 className="text-base font-semibold">Contact</h2>
						<p className="text-xs leading-relaxed text-muted-foreground">
							If you have any questions, please contact us through our{" "}
							<a
								href="https://github.com/carvalhocaio/link-arch"
								target="_blank"
								rel="noopener noreferrer"
								className="underline underline-offset-4 hover:text-primary-ink"
							>
								GitHub repository
							</a>
							.
						</p>
					</section>
				</article>
			</main>
		</div>
	);
}
