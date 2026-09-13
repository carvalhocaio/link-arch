"use client";

import { Info, MousePointer2, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { EditUrlDialog } from "@/components/url/edit-url-dialog";
import { LinkFavicon } from "@/components/url/link-favicon";
import { LinkStatusBadge, ShortKeyLink } from "@/components/url/link-identity";
import { LinkRowActions } from "@/components/url/link-row-actions";
import { ShortUrlResult } from "@/components/url/short-url-result";
import { ShortenLinkForm } from "@/components/url/shorten-link-form";
import { useLinkEditor } from "@/hooks/use-link-editor";
import { useMyUrls } from "@/hooks/use-my-urls";
import { useShortenForm } from "@/hooks/use-shorten-form";
import { type ActivityItem, toActivityItems, toShortUrl } from "@/lib/activity";
import { copyToClipboard } from "@/lib/clipboard";
import { buildQuickStats } from "@/lib/dashboard-metrics";
import { formatExpiryInBrowserTimezone } from "@/lib/expiry";

const STAT_ICON = {
	positive: MousePointer2,
	featured: Star,
	neutral: Info,
} as const;

export function DashboardView() {
	const { data: myUrls, isLoading, isError, refetch } = useMyUrls();
	const shortenForm = useShortenForm();

	const myUrlsById = useMemo(() => new Map((myUrls ?? []).map((url) => [url.id, url])), [myUrls]);
	const quickStats = useMemo(() => buildQuickStats(myUrls ?? []), [myUrls]);
	const recentActivity = useMemo(() => toActivityItems(myUrls ?? []).slice(0, 3), [myUrls]);

	const editor = useLinkEditor(myUrlsById);

	async function handleCopy(activity: ActivityItem) {
		await copyToClipboard(toShortUrl(activity.key), {
			success: "Short URL copied to clipboard",
			error: "Failed to copy short URL",
		});
	}

	return (
		<DashboardShell title="Dashboard">
			<main
				id="main-content"
				className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-3 py-6 sm:px-4 md:px-8"
			>
				<section className="border border-border bg-card p-4 md:p-6">
					<h2 className="mb-4 text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
						Shorten new link
					</h2>
					<ShortenLinkForm form={shortenForm} />
				</section>

				<Dialog
					open={!!shortenForm.createdLink}
					onOpenChange={(open) => {
						if (!open) shortenForm.reset();
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Short URL ready</DialogTitle>
							<DialogDescription>
								Your shortened link has been created successfully.
							</DialogDescription>
						</DialogHeader>
						{shortenForm.createdLink ? (
							<ShortUrlResult
								shortUrl={shortenForm.createdLink.shortUrl}
								copied={shortenForm.copied}
								onCopy={shortenForm.copyCreatedLink}
							/>
						) : null}
					</DialogContent>
				</Dialog>

				<EditUrlDialog
					open={!!editor.activity}
					onOpenChange={editor.onOpenChange}
					url={editor.url}
					onUrlChange={editor.setUrl}
					urlKey={editor.key}
					onUrlKeyChange={editor.setKey}
					urlKeyError={editor.keyError}
					isActive={editor.isActive}
					onIsActiveChange={editor.setIsActive}
					expiresOn={editor.expiresOn}
					onExpiresOnChange={editor.setExpiresOn}
					onSave={editor.save}
					isPending={editor.isSaving}
				/>

				<section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
					{quickStats.map((stat) => {
						const Icon = STAT_ICON[stat.tone];

						return (
							<article
								key={stat.title}
								className="flex min-h-32 flex-col justify-between border border-border bg-card p-4"
							>
								<div className="flex items-start justify-between gap-2">
									<p className="text-[10px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
										{stat.title}
									</p>
									<Icon
										className={`size-4 shrink-0 ${
											stat.tone === "positive" ? "text-primary-ink" : "text-muted-foreground"
										}`}
										aria-hidden="true"
									/>
								</div>
								<div className="mt-4">
									<p
										className={`font-semibold tracking-tight ${
											stat.tone === "featured" ? "text-xl" : "text-3xl"
										}`}
									>
										{stat.value}
									</p>
									<p
										className={`mt-1 flex items-center gap-1 text-[11px] ${
											stat.tone === "positive" ? "text-primary-ink" : "text-muted-foreground"
										}`}
									>
										{stat.tone === "positive" ? (
											<TrendingUp className="size-3" aria-hidden="true" />
										) : null}
										{stat.detail}
									</p>
								</div>
							</article>
						);
					})}
				</section>

				<section className="space-y-3">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-sm font-semibold tracking-tight">Recent activity</h2>
						<Link
							href="/my-links"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto p-0 text-[11px] font-semibold",
							)}
						>
							View all links
						</Link>
					</div>

					{isError ? (
						<div className="flex flex-wrap items-center gap-3 border border-border p-4 text-xs">
							<p className="text-destructive">Could not load your links.</p>
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Retry
							</Button>
						</div>
					) : isLoading ? (
						<p className="border border-border p-4 text-xs text-muted-foreground">
							Loading links...
						</p>
					) : recentActivity.length === 0 ? (
						<p className="border border-border p-4 text-xs text-muted-foreground">No links yet</p>
					) : (
						<ul className="divide-y divide-border border border-border">
							{recentActivity.map((activity) => {
								const urlMeta = myUrlsById.get(activity.id);
								const isActive = urlMeta?.isActive ?? true;

								return (
									<li
										key={activity.id}
										className="flex flex-col gap-3 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4"
									>
										<div className="flex min-w-0 flex-1 items-start gap-3">
											<LinkFavicon src={activity.favicon} className="mt-0.5" />
											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<ShortKeyLink activity={activity} />
													<LinkStatusBadge isActive={isActive} />
													<span className="shrink-0 text-[11px] font-semibold text-primary-ink">
														{activity.clicks.toLocaleString()} clicks
													</span>
												</div>
												<p className="mt-0.5 truncate text-[11px] text-muted-foreground">
													{activity.destination}
												</p>
												{urlMeta?.expiresAt ? (
													<p className="mt-0.5 text-[10px] text-muted-foreground/80">
														Available until {formatExpiryInBrowserTimezone(urlMeta.expiresAt)}
													</p>
												) : null}
											</div>
										</div>
										<LinkRowActions
											activity={activity}
											onCopy={handleCopy}
											onEdit={editor.open}
											onDelete={editor.remove}
											isDeleting={editor.isDeleting}
										/>
									</li>
								);
							})}
						</ul>
					)}
				</section>
			</main>
		</DashboardShell>
	);
}
