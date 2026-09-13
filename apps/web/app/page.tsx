import { ArrowRight, BarChart2, Clock, Link2, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/version";

export const metadata: Metadata = {
	// `title.template` from the root layout does not apply to the root page — a
	// template only reaches child segments — so the brand is spelled out here.
	title: { absolute: "LinkArch — Short links that work as hard as you do" },
	description:
		"LinkArch turns long URLs into clean, trackable short links — custom aliases, click analytics, and expiry controls built in.",
};

const features = [
	{
		icon: Zap,
		title: "Custom aliases",
		description: "Choose a memorable short key that reflects your brand or content.",
	},
	{
		icon: BarChart2,
		title: "Click analytics",
		description: "Track how your links perform with real-time click counts.",
	},
	{
		icon: Clock,
		title: "Expiry control",
		description: "Set an expiration date so links become inactive automatically.",
	},
] as const;

export default function LandingPage() {
	return (
		<div className="flex min-h-svh flex-col bg-background">
			<header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6 md:px-10">
				<div className="flex items-center gap-2">
					<span className="flex size-6 items-center justify-center bg-primary text-primary-foreground">
						<Link2 className="size-3.5" aria-hidden="true" />
					</span>
					<span className="text-xs font-semibold tracking-tight">LinkArch</span>
				</div>
				<Link href="/login" className={buttonVariants({ variant: "outline" })}>
					Sign in
				</Link>
			</header>

			<main
				id="main-content"
				className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 md:px-10 md:py-24"
			>
				<p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
					URL infrastructure
				</p>
				{/* Mono runs far wider than a proportional face, so the display scale
				    stays a step below what a sans heading would take. */}
				<h1 className="mt-4 text-xl leading-tight font-bold tracking-tight sm:text-2xl md:text-4xl">
					Short links that work
					<br className="hidden sm:inline" /> as hard as you do
				</h1>
				<p className="mt-5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
					LinkArch turns long, unwieldy URLs into clean, trackable short links — with custom
					aliases, click analytics, and expiry controls built in.
				</p>
				<div className="mt-8">
					<Link href="/login" className={buttonVariants({ size: "lg" })}>
						Get started
						<ArrowRight className="size-4" aria-hidden="true" />
					</Link>
				</div>

				<section aria-labelledby="features-heading" className="mt-20 border-t border-border">
					<h2 id="features-heading" className="sr-only">
						Features
					</h2>
					<ul className="grid sm:grid-cols-3">
						{features.map((feature) => (
							<li
								key={feature.title}
								className="border-b border-border p-5 sm:border-r sm:border-b-0 sm:last:border-r-0"
							>
								<feature.icon className="size-4 text-primary-ink" aria-hidden="true" />
								<h3 className="mt-3 text-xs font-semibold">{feature.title}</h3>
								<p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
									{feature.description}
								</p>
							</li>
						))}
					</ul>
				</section>
			</main>

			<footer className="border-t border-border px-4 py-5 text-[11px] text-muted-foreground sm:px-6 md:px-10">
				<div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-3 gap-y-1">
					<span>v{APP_VERSION}</span>
					<span aria-hidden="true">·</span>
					<Link
						href="/privacy"
						className="underline-offset-4 hover:text-primary-ink hover:underline"
					>
						Privacy
					</Link>
					<span aria-hidden="true">·</span>
					<Link href="/terms" className="underline-offset-4 hover:text-primary-ink hover:underline">
						Terms
					</Link>
				</div>
			</footer>
		</div>
	);
}
