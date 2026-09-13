"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Download, Filter, Search, Zap } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EditUrlDialog } from "@/components/url/edit-url-dialog";
import { LinkFavicon } from "@/components/url/link-favicon";
import { LinkStatusBadge, ShortKeyLink } from "@/components/url/link-identity";
import { LinkRowActions } from "@/components/url/link-row-actions";
import { ShortUrlResult } from "@/components/url/short-url-result";
import { ShortenLinkForm } from "@/components/url/shorten-link-form";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useLinkEditor } from "@/hooks/use-link-editor";
import { useMyUrls } from "@/hooks/use-my-urls";
import { useShortenForm } from "@/hooks/use-shorten-form";
import { type ActivityItem, shortHost, toActivityItems, toShortUrl } from "@/lib/activity";
import { copyToClipboard } from "@/lib/clipboard";
import { formatExpiryInBrowserTimezone } from "@/lib/expiry";
import { buildLinksCsv, downloadCsv, formatCreatedAt } from "@/lib/export-links";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "active" | "inactive";
type SortField = "clicks" | "createdAt";
type SortDirection = "asc" | "desc";

const FILTER_LABEL: Record<StatusFilter, string> = {
	all: "Filter",
	active: "Active",
	inactive: "Inactive",
};

export function MyLinksView() {
	const { data: myUrls, isLoading, isError, refetch } = useMyUrls();
	const shortenForm = useShortenForm();
	const searchId = useId();

	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortField, setSortField] = useState<SortField>("createdAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	// Filtering and sorting walk the whole list, so debounce the search rather
	// than redoing that work on every keystroke.
	const debouncedSearch = useDebouncedValue(searchQuery);

	const activities = useMemo(() => toActivityItems(myUrls ?? []), [myUrls]);
	const myUrlsById = useMemo(() => new Map((myUrls ?? []).map((url) => [url.id, url])), [myUrls]);

	const editor = useLinkEditor(myUrlsById);

	const filteredActivities = useMemo(() => {
		const search = debouncedSearch.trim().toLowerCase();
		const host = shortHost();

		return activities.filter((activity) => {
			const isActive = myUrlsById.get(activity.id)?.isActive ?? true;

			if (statusFilter === "active" && !isActive) return false;
			if (statusFilter === "inactive" && isActive) return false;
			if (!search) return true;

			return (
				`${host}${activity.slug}`.toLowerCase().includes(search) ||
				activity.destination.toLowerCase().includes(search)
			);
		});
	}, [activities, myUrlsById, debouncedSearch, statusFilter]);

	const sortedActivities = useMemo(() => {
		const factor = sortDirection === "asc" ? 1 : -1;

		return [...filteredActivities].sort((left, right) => {
			if (sortField === "clicks") {
				return (left.clicks - right.clicks) * factor;
			}

			const leftTime = new Date(myUrlsById.get(left.id)?.createdAt ?? "").getTime();
			const rightTime = new Date(myUrlsById.get(right.id)?.createdAt ?? "").getTime();

			return (
				((Number.isNaN(leftTime) ? 0 : leftTime) - (Number.isNaN(rightTime) ? 0 : rightTime)) *
				factor
			);
		});
	}, [filteredActivities, myUrlsById, sortDirection, sortField]);

	const totalPages = Math.max(1, Math.ceil(sortedActivities.length / PAGE_SIZE));

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const paginatedActivities = useMemo(
		() => sortedActivities.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
		[currentPage, sortedActivities],
	);

	const rangeStart = filteredActivities.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
	const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredActivities.length);

	function toggleSort(field: SortField) {
		if (sortField === field) {
			setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDirection("desc");
		}

		setCurrentPage(1);
	}

	function sortIcon(field: SortField) {
		if (sortField !== field) return <ArrowUpDown className="size-3" aria-hidden="true" />;
		return sortDirection === "asc" ? (
			<ArrowUp className="size-3" aria-hidden="true" />
		) : (
			<ArrowDown className="size-3" aria-hidden="true" />
		);
	}

	async function handleCopy(activity: ActivityItem) {
		await copyToClipboard(toShortUrl(activity.key), {
			success: "Short URL copied to clipboard",
			error: "Failed to copy short URL",
		});
	}

	function handleExportCsv() {
		if (sortedActivities.length === 0) {
			toast.error("No links to export");
			return;
		}

		try {
			downloadCsv(
				buildLinksCsv(sortedActivities, myUrlsById),
				`my-links-${new Date().toISOString().slice(0, 10)}.csv`,
			);
			toast.success("CSV exported successfully");
		} catch {
			toast.error("Failed to export CSV");
		}
	}

	function handleCreateOpenChange(open: boolean) {
		setIsCreateOpen(open);
		if (!open) shortenForm.reset();
	}

	const hasFilters = statusFilter !== "all" || debouncedSearch.trim() !== "";
	const isEmpty = paginatedActivities.length === 0;

	return (
		<DashboardShell title="My Links">
			<main
				id="main-content"
				className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-3 py-6 sm:px-4 md:px-8"
			>
				<section className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">My Links</h2>
						<p className="mt-1 text-[11px] text-muted-foreground">
							Manage and monitor your digital infrastructure links.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger render={<Button variant="outline" />}>
								<Filter className="size-4" aria-hidden="true" />
								{FILTER_LABEL[statusFilter]}
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuRadioGroup
									value={statusFilter}
									onValueChange={(value) => {
										setStatusFilter(value as StatusFilter);
										setCurrentPage(1);
									}}
								>
									<DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>

						<Button variant="outline" onClick={handleExportCsv}>
							<Download className="size-4" aria-hidden="true" />
							Export
						</Button>

						<Button onClick={() => setIsCreateOpen(true)}>
							<Zap className="size-4" aria-hidden="true" />
							New Shorten
						</Button>
					</div>
				</section>

				<section>
					<label htmlFor={searchId} className="sr-only">
						Search links
					</label>
					<div className="relative">
						<Search
							className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							id={searchId}
							type="search"
							value={searchQuery}
							onChange={(event) => {
								setSearchQuery(event.target.value);
								setCurrentPage(1);
							}}
							placeholder="Search by identity or destination..."
							className="w-full pl-8"
						/>
					</div>
				</section>

				<section className="border border-border bg-card">
					{isError ? (
						<div className="flex flex-wrap items-center justify-center gap-3 p-8 text-xs">
							<p className="text-destructive">Could not load your links.</p>
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Retry
							</Button>
						</div>
					) : isLoading ? (
						<p className="p-8 text-center text-xs text-muted-foreground">Loading links...</p>
					) : isEmpty ? (
						<div className="p-8 text-center text-xs text-muted-foreground">
							<p>{hasFilters ? "No links match your filters" : "No links yet"}</p>
							{hasFilters ? (
								<Button
									variant="outline"
									size="sm"
									className="mt-3"
									onClick={() => {
										setStatusFilter("all");
										setSearchQuery("");
										setCurrentPage(1);
									}}
								>
									Clear filters
								</Button>
							) : (
								<Button size="sm" className="mt-3" onClick={() => setIsCreateOpen(true)}>
									<Zap className="size-4" aria-hidden="true" />
									Create your first link
								</Button>
							)}
						</div>
					) : (
						<>
							{/* Cards below md; the table needs more width than a phone has. */}
							<ul className="divide-y divide-border md:hidden">
								{paginatedActivities.map((activity) => {
									const meta = myUrlsById.get(activity.id);
									const isActive = meta?.isActive ?? true;

									return (
										<li key={activity.id} className="space-y-2 p-3">
											<div className="flex items-start gap-2">
												<LinkFavicon src={activity.favicon} className="mt-0.5" />
												<div className="min-w-0 flex-1">
													<div className="flex flex-wrap items-center gap-2">
														<ShortKeyLink activity={activity} />
														<LinkStatusBadge isActive={isActive} />
													</div>
													<p className="mt-1 break-all text-[11px] text-muted-foreground">
														{activity.destination}
													</p>
												</div>
											</div>
											<div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
												<span>
													<span className="font-semibold text-foreground">
														{activity.clicks.toLocaleString()}
													</span>{" "}
													clicks · {formatCreatedAt(meta?.createdAt)}
												</span>
												<LinkRowActions
													activity={activity}
													onCopy={handleCopy}
													onEdit={editor.open}
													onDelete={editor.remove}
													isDeleting={editor.isDeleting}
												/>
											</div>
											{meta?.expiresAt ? (
												<p className="text-[10px] text-muted-foreground/80">
													Available until {formatExpiryInBrowserTimezone(meta.expiresAt)}
												</p>
											) : null}
										</li>
									);
								})}
							</ul>

							<div className="hidden overflow-x-auto md:block">
								<table className="w-full text-left">
									<thead className="border-b border-border bg-muted/50">
										<tr className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
											<th className="px-4 py-3">Link Identity</th>
											<th className="px-4 py-3">Destination</th>
											<th className="px-4 py-3 text-center">Status</th>
											<th className="px-4 py-3 text-right">
												<Button
													variant="ghost"
													size="xs"
													className="h-auto gap-1 p-0 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
													onClick={() => toggleSort("clicks")}
												>
													Analytics
													{sortIcon("clicks")}
												</Button>
											</th>
											<th className="px-4 py-3 text-right">
												<Button
													variant="ghost"
													size="xs"
													className="h-auto gap-1 p-0 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
													onClick={() => toggleSort("createdAt")}
												>
													Created
													{sortIcon("createdAt")}
												</Button>
											</th>
											<th className="px-4 py-3 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{paginatedActivities.map((activity) => {
											const meta = myUrlsById.get(activity.id);
											const isActive = meta?.isActive ?? true;

											return (
												<tr key={activity.id} className="transition-colors hover:bg-muted/30">
													<td className="px-4 py-3">
														<div className="flex items-center gap-2">
															<LinkFavicon src={activity.favicon} />
															<ShortKeyLink activity={activity} />
														</div>
													</td>
													<td className="max-w-[240px] px-4 py-3 text-[11px] text-muted-foreground">
														<Tooltip>
															<TooltipTrigger
																render={<button type="button" />}
																className="block w-full cursor-default text-left outline-none focus-visible:ring-1 focus-visible:ring-ring"
															>
																<span className="block truncate">{activity.destination}</span>
																{meta?.expiresAt ? (
																	<span className="mt-1 block text-[10px] text-muted-foreground/80">
																		Available until {formatExpiryInBrowserTimezone(meta.expiresAt)}
																	</span>
																) : null}
															</TooltipTrigger>
															<TooltipContent
																side="top"
																sideOffset={6}
																className="max-w-none break-all whitespace-normal"
															>
																{activity.destination}
															</TooltipContent>
														</Tooltip>
													</td>
													<td className="px-4 py-3 text-center">
														<LinkStatusBadge isActive={isActive} />
													</td>
													<td className="px-4 py-3 text-right">
														<span className="text-xs font-semibold">
															{activity.clicks.toLocaleString()}
														</span>
														<span className="block text-[10px] text-muted-foreground">Clicks</span>
													</td>
													<td className="px-4 py-3 text-right text-[11px] text-muted-foreground">
														{formatCreatedAt(meta?.createdAt)}
													</td>
													<td className="px-4 py-3">
														<div className="flex justify-end">
															<LinkRowActions
																activity={activity}
																onCopy={handleCopy}
																onEdit={editor.open}
																onDelete={editor.remove}
																isDeleting={editor.isDeleting}
															/>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>

							<div className="flex flex-col gap-2 border-t border-border bg-muted/50 px-4 py-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
								<p>
									Showing <span className="font-medium text-foreground">{rangeStart}</span>-
									<span className="font-medium text-foreground">{rangeEnd}</span> of{" "}
									<span className="font-medium text-foreground">{filteredActivities.length}</span>{" "}
									links
								</p>
								<div className="flex items-center justify-between gap-3 sm:justify-end">
									<span>
										Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
										<span className="font-medium text-foreground">{totalPages}</span>
									</span>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
											disabled={currentPage <= 1}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
											disabled={currentPage >= totalPages}
										>
											Next
										</Button>
									</div>
								</div>
							</div>
						</>
					)}
				</section>

				<Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>New Shorten</DialogTitle>
							<DialogDescription>
								Create a new short URL without leaving My Links.
							</DialogDescription>
						</DialogHeader>
						{shortenForm.createdLink ? (
							<ShortUrlResult
								shortUrl={shortenForm.createdLink.shortUrl}
								copied={shortenForm.copied}
								onCopy={shortenForm.copyCreatedLink}
							/>
						) : (
							<ShortenLinkForm form={shortenForm} stacked />
						)}
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
			</main>
		</DashboardShell>
	);
}
