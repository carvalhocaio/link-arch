import { ArrowRight, BarChart2, Clock, Link2, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/version";

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
		<div className="surface-stage relative flex min-h-svh flex-col overflow-hidden">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_22%,rgb(82_163_43_/_14%),transparent_34%),radial-gradient(circle_at_92%_2%,rgb(95_94_97_/_8%),transparent_30%)]" />

			<header className="relative flex items-center justify-between px-6 py-5 md:px-10">
				<div className="flex items-center gap-2 text-primary">
					<Link2 className="size-4" aria-hidden="true" />
					<span className="text-sm font-semibold">LinkArch</span>
				</div>
				<Button variant="outline" asChild>
					<Link href="/login">Sign in</Link>
				</Button>
			</header>

			<main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:px-10">
				<h1 className="text-4xl font-bold tracking-tight md:text-5xl">
					Short links that work
					<br />
					as hard as you do
				</h1>
				<p className="mt-4 max-w-md text-base text-muted-foreground">
					LinkArch turns long, unwieldy URLs into clean, trackable short links — with custom
					aliases, click analytics, and expiry controls built in.
				</p>
				<Button asChild size="lg" className="mt-8">
					<Link href="/login">
						Get started
						<ArrowRight className="size-4" />
					</Link>
				</Button>

				<section aria-label="Features" className="mt-20 grid w-full max-w-3xl gap-8 sm:grid-cols-3">
					{features.map((feature) => (
						<div key={feature.title} className="flex flex-col items-center gap-3 text-center">
							<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
								<feature.icon className="size-5" aria-hidden="true" />
							</div>
							<h2 className="text-sm font-semibold">{feature.title}</h2>
							<p className="text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
						</div>
					))}
				</section>
			</main>

			<footer className="relative py-6 text-center text-xs text-muted-foreground">
				<span>v{APP_VERSION}</span>
				<span className="mx-2">·</span>
				<Link href="/privacy" className="underline-offset-4 hover:text-primary hover:underline">
					Privacy
				</Link>
				<span className="mx-2">·</span>
				<Link href="/terms" className="underline-offset-4 hover:text-primary hover:underline">
					Terms
				</Link>
			</footer>
		</div>
	);
}
