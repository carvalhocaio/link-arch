"use client";

import { ArrowUpRight, ChartNoAxesCombined, Link2, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { ShortenResult } from "@/components/shorten-result";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UrlShortenerForm } from "@/components/url-shortener-form";
import type { ShortenResponse } from "@/lib/api";

const recentActivity = [
	{
		slug: "l.architect/docs-24",
		destination: "google.com/drive/folders/shared-resource-hub",
		clicks: "1,204",
	},
	{
		slug: "l.architect/team-slack",
		destination: "join.slack.com/t/architecture-community",
		clicks: "842",
	},
	{
		slug: "l.architect/v3-design",
		destination: "figma.com/file/arch-prototypes-v3",
		clicks: "4,521",
	},
] as const;

const stats = [
	{
		label: "Total Clicks",
		value: "42,892",
		helper: "+12.5% from last month",
	},
	{
		label: "Active Links",
		value: "156",
		helper: "4 scheduled for expiry",
	},
	{
		label: "Top Performing",
		value: "/summer-campaign",
		helper: "12.4k clicks - Source: Twitter",
	},
] as const;

export default function Page() {
	const [latestShortUrl, setLatestShortUrl] = useState<ShortenResponse | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	function handleSuccess(data: ShortenResponse) {
		setLatestShortUrl(data);
		setIsCreateDialogOpen(false);
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="surface-stage">
				<header className="frosted sticky top-0 z-20 border-b border-border/35">
					<div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
						<div className="flex items-center gap-3">
							<SidebarTrigger className="-ml-1" />
							<div>
								<p className="text-sm font-medium">Dashboard</p>
							</div>
						</div>
						<Button
							size="sm"
							className="gap-1.5 cursor-pointer"
							onClick={() => setIsCreateDialogOpen(true)}
						>
							<Sparkles className="size-3.5" />
							Create New Link
						</Button>
					</div>
				</header>

				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Link</DialogTitle>
							<DialogDescription>
								Paste your URL to generate a short link with analytics.
							</DialogDescription>
						</DialogHeader>
						<UrlShortenerForm onSuccess={handleSuccess} />
					</DialogContent>
				</Dialog>

				<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 md:px-6">
					<section className="grid gap-4 lg:grid-cols-3">
						{stats.map((item) => (
							<article key={item.label} className="surface-floating ghost-border rounded-lg p-5">
								<p className="text-xs text-muted-foreground">{item.label}</p>
								<p className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
									{item.value}
								</p>
								<p className="mt-2 text-xs text-muted-foreground">{item.helper}</p>
							</article>
						))}
					</section>

					<section className="surface-section ghost-border rounded-lg p-5 md:p-6">
						<div className="mb-4 flex items-center justify-between gap-3">
							<div>
								<h1 className="text-lg font-semibold tracking-tight md:text-xl">
									Shorten New Link
								</h1>
								<p className="text-xs text-muted-foreground">
									Auto-generated alias with detailed analytics.
								</p>
							</div>
							<span className="hidden rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground sm:inline-flex">
								Link Architect Mode
							</span>
						</div>
						<UrlShortenerForm onSuccess={handleSuccess} />
						{latestShortUrl ? (
							<div className="mt-4">
								<ShortenResult data={latestShortUrl} />
							</div>
						) : null}
					</section>

					<section className="grid gap-6 xl:grid-cols-[1fr_300px]">
						<div className="surface-floating ghost-border rounded-lg p-5 md:p-6">
							<div className="mb-4 flex items-center justify-between gap-3">
								<h2 className="text-base font-semibold">Recent Activity</h2>
								<Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
									View all links
									<ArrowUpRight className="size-3.5" />
								</Button>
							</div>
							<div className="space-y-2">
								{recentActivity.map((item) => (
									<article
										key={item.slug}
										className="rounded-md bg-muted/75 p-4 transition-colors duration-200 hover:bg-card"
									>
										<div className="mb-1 flex items-center justify-between gap-3">
											<p className="text-sm font-medium">{item.slug}</p>
											<span className="text-xs text-primary">{item.clicks} clicks</span>
										</div>
										<p className="truncate text-xs text-muted-foreground">{item.destination}</p>
									</article>
								))}
							</div>
						</div>

						<aside className="space-y-4">
							<div className="surface-floating ghost-border rounded-lg p-5">
								<div className="mb-3 flex items-center gap-2 text-sm font-medium">
									<ChartNoAxesCombined className="size-4 text-primary" />
									Traffic Origins
								</div>
								<div className="space-y-2 text-xs">
									<p className="flex items-center justify-between">
										<span className="text-muted-foreground">Direct Traffic</span>
										<strong>65%</strong>
									</p>
									<p className="flex items-center justify-between">
										<span className="text-muted-foreground">Referral</span>
										<strong>20%</strong>
									</p>
									<p className="flex items-center justify-between">
										<span className="text-muted-foreground">Social</span>
										<strong>15%</strong>
									</p>
								</div>
							</div>

							<div className="surface-floating ghost-border rounded-lg p-5">
								<div className="mb-2 flex items-center gap-2 text-sm font-medium">
									<Link2 className="size-4 text-primary" />
									Live Global Activity
								</div>
								<p className="text-xs text-muted-foreground">New click from London, UK</p>
							</div>
						</aside>
					</section>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
