"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CustomKeyField } from "@/components/url/custom-key-field";
import { cn } from "@/lib/utils";

// react-day-picker + date-fns are only needed once the expiry popover opens, so
// keep them out of the initial bundle for both dashboard routes.
const Calendar = dynamic(() => import("@/components/ui/calendar").then((m) => m.Calendar), {
	ssr: false,
	loading: () => <div className="size-64 animate-pulse bg-muted" />,
});

const PRESETS = [
	{ label: "Today", offsetDays: 0 },
	{ label: "Tomorrow", offsetDays: 1 },
	{ label: "In a week", offsetDays: 7 },
	{ label: "In 2 weeks", offsetDays: 14 },
] as const;

interface EditUrlDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	url: string;
	onUrlChange: (value: string) => void;
	urlKey: string;
	onUrlKeyChange: (value: string) => void;
	urlKeyError: string | null;
	isActive: boolean;
	onIsActiveChange: (value: boolean) => void;
	expiresOn: string;
	onExpiresOnChange: (value: string) => void;
	onSave: () => void;
	isPending: boolean;
}

export function EditUrlDialog({
	open,
	onOpenChange,
	url,
	onUrlChange,
	urlKey,
	onUrlKeyChange,
	urlKeyError,
	isActive,
	onIsActiveChange,
	expiresOn,
	onExpiresOnChange,
	onSave,
	isPending,
}: EditUrlDialogProps) {
	const urlId = useId();
	const activeLabelId = useId();

	const selectedExpiryDate = parseDateInput(expiresOn);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const disabledDays = isPending ? true : [{ before: today }];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit short link</DialogTitle>
					<DialogDescription>Update destination, key, status, and expiry.</DialogDescription>
				</DialogHeader>

				<div className="space-y-3">
					<div className="space-y-1.5">
						<label htmlFor={urlId} className="block text-[11px] font-medium">
							Destination URL
						</label>
						<Input
							id={urlId}
							type="url"
							value={url}
							onChange={(event) => onUrlChange(event.target.value)}
							placeholder="https://example.com/path"
							disabled={isPending}
							className="bg-card"
						/>
					</div>

					<CustomKeyField
						value={urlKey}
						onChange={onUrlKeyChange}
						error={urlKeyError}
						disabled={isPending}
					/>

					<div className="flex items-center justify-between gap-3 border border-border px-3 py-2.5">
						<div>
							<p id={activeLabelId} className="text-xs font-medium">
								Link active
							</p>
							<p className="text-[11px] text-muted-foreground">
								Disable to stop redirects for this link.
							</p>
						</div>
						<Switch
							checked={isActive}
							onCheckedChange={onIsActiveChange}
							disabled={isPending}
							aria-labelledby={activeLabelId}
						/>
					</div>

					<div className="space-y-2 border border-border px-3 py-2.5">
						<div>
							<p className="text-xs font-medium">Scheduled expiry</p>
							<p className="text-[11px] text-muted-foreground">
								Optional. Link will be disabled at 23:59:59 UTC on this date.
							</p>
						</div>
						<Popover>
							<div className="relative">
								<PopoverTrigger
									render={
										<Button
											variant="outline"
											disabled={isPending}
											className={cn(
												"w-full justify-start bg-card pr-9 text-left font-normal",
												!selectedExpiryDate && "text-muted-foreground",
											)}
										/>
									}
								>
									<CalendarIcon className="size-4" aria-hidden="true" />
									{selectedExpiryDate ? (
										format(selectedExpiryDate, "PPP")
									) : (
										<span>Select expiry date</span>
									)}
								</PopoverTrigger>
								{selectedExpiryDate ? (
									<button
										type="button"
										className="absolute inset-y-0 right-2 z-10 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
										onClick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											onExpiresOnChange("");
										}}
										disabled={isPending}
										aria-label="Clear expiry date"
									>
										<X className="size-4" aria-hidden="true" />
									</button>
								) : null}
							</div>
							<PopoverContent
								className="w-auto gap-0 border border-border bg-background p-0"
								align="start"
							>
								<Calendar
									mode="single"
									selected={selectedExpiryDate}
									onSelect={(date) => onExpiresOnChange(toDateInputValue(date))}
									disabled={disabledDays}
								/>
								<div className="w-full border-t border-border p-2">
									<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
										{PRESETS.map((preset) => (
											<Button
												key={preset.label}
												variant="outline"
												size="sm"
												className="w-full"
												onClick={() =>
													onExpiresOnChange(toDateInputValue(getPresetDate(preset.offsetDays)))
												}
												disabled={isPending}
											>
												{preset.label}
											</Button>
										))}
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>

					<Button onClick={onSave} disabled={isPending} className="w-full">
						{isPending ? "Saving..." : "Save changes"}
						{isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function parseDateInput(value: string) {
	if (!value) {
		return undefined;
	}

	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) {
		return undefined;
	}

	return new Date(year, month - 1, day);
}

function toDateInputValue(value: Date | undefined) {
	if (!value) {
		return "";
	}

	const year = value.getFullYear();
	const month = String(value.getMonth() + 1).padStart(2, "0");
	const day = String(value.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function getPresetDate(offsetDays: number) {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	date.setDate(date.getDate() + offsetDays);

	return date;
}
