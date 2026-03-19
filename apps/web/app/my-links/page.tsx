"use client";

import { Copy, Download, Filter, Link2, Pencil, Trash2, TrendingUp } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const links = [
	{
		slug: "l.arch/summer-campaign",
		destination: "https://marketing.enterprise.com/seasonal/2024/summer-sale-global",
		status: "Active",
		clicks: "12,482",
		createdAt: "Oct 12, 2023",
	},
	{
		slug: "l.arch/product-v3-demo",
		destination: "https://v3.product.io/demo-session/hq-992-alpha",
		status: "Active",
		clicks: "3,102",
		createdAt: "Oct 09, 2023",
	},
	{
		slug: "l.arch/legacy-docs",
		destination: "https://docs.v1.internal.dev/archive/2021-final-build",
		status: "Inactive",
		clicks: "458",
		createdAt: "Jan 05, 2022",
	},
	{
		slug: "l.arch/social-bio",
		destination: "https://bio.link/architect-enterprise-official-hq",
		status: "Active",
		clicks: "84,219",
		createdAt: "Aug 20, 2023",
	},
] as const;

const insights = [
	{
		title: "Bulk Management",
		description: "Update destination URLs or tags for multiple links in a single operation.",
	},
	{
		title: "Deep-Link Protection",
		description: "Enable password protection or expiration on sensitive operational links.",
	},
	{
		title: "Automatic Rerouting",
		description: "Route traffic by device, location, or time for optimized conversion.",
	},
] as const;

export default function MyLinksPage() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="surface-stage">
				<header className="frosted sticky top-0 z-20 border-b border-border/35">
					<div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
						<div className="flex items-center gap-3">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="h-4" />
							<div>
								<p className="text-sm font-medium">My Links</p>
								<p className="text-xs text-muted-foreground">Manage digital infrastructure</p>
							</div>
						</div>
						<Button size="sm" className="gap-1.5">
							<Link2 className="size-3.5" />
							Create New Link
						</Button>
					</div>
				</header>

				<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-6">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
						<div>
							<h1 className="text-xl font-semibold tracking-tight">My Links</h1>
							<p className="text-sm text-muted-foreground">
								Manage and monitor your digital infrastructure links.
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Filter className="size-3.5" />
								Filter
							</Button>
							<Button variant="outline" size="sm">
								<Download className="size-3.5" />
								Export
							</Button>
						</div>
					</div>

					<section className="surface-floating ghost-border overflow-hidden rounded-lg">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[860px] text-left text-sm">
								<thead className="bg-muted/80 text-xs text-muted-foreground">
									<tr>
										<th className="px-4 py-3 font-medium">Link Identity</th>
										<th className="px-4 py-3 font-medium">Destination</th>
										<th className="px-4 py-3 font-medium">Status</th>
										<th className="px-4 py-3 font-medium">Analytics</th>
										<th className="px-4 py-3 font-medium">Created</th>
										<th className="px-4 py-3 font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{links.map((row) => (
										<tr key={row.slug} className="bg-card transition-colors hover:bg-muted/70">
											<td className="px-4 py-4">
												<p className="font-medium">{row.slug}</p>
												<p className="text-xs tracking-[0.08em] text-muted-foreground uppercase">
													short-url
												</p>
											</td>
											<td className="max-w-[320px] px-4 py-4 text-xs text-muted-foreground">
												<p className="truncate">{row.destination}</p>
											</td>
											<td className="px-4 py-4">
												<span
													className={`rounded-md px-2 py-1 text-xs ${
														row.status === "Active"
															? "bg-primary/12 text-primary"
															: "bg-muted text-muted-foreground"
													}`}
												>
													{row.status}
												</span>
											</td>
											<td className="px-4 py-4 text-xs">
												<p className="font-medium">{row.clicks}</p>
												<p className="text-muted-foreground">Clicks</p>
											</td>
											<td className="px-4 py-4 text-xs text-muted-foreground">{row.createdAt}</td>
											<td className="px-4 py-4">
												<div className="flex items-center gap-1">
													<Button variant="ghost" size="icon-sm" title="Copy link">
														<Copy className="size-3.5" />
													</Button>
													<Button variant="ghost" size="icon-sm" title="Edit">
														<Pencil className="size-3.5" />
													</Button>
													<Button variant="ghost" size="icon-sm" title="Analytics">
														<TrendingUp className="size-3.5" />
													</Button>
													<Button variant="ghost" size="icon-sm" title="Delete">
														<Trash2 className="size-3.5" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="flex items-center justify-between px-4 py-4 text-xs text-muted-foreground">
							<span>Showing 1-10 of 24 links</span>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm">
									Previous
								</Button>
								<Button variant="outline" size="sm">
									Next
								</Button>
							</div>
						</div>
					</section>

					<section className="grid gap-3 lg:grid-cols-3">
						{insights.map((insight) => (
							<article key={insight.title} className="surface-floating ghost-border rounded-lg p-5">
								<h2 className="text-sm font-medium">{insight.title}</h2>
								<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
									{insight.description}
								</p>
							</article>
						))}
					</section>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
