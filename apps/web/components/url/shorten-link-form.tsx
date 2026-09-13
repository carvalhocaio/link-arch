"use client";

import { Link2, Loader2, Zap } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { CustomKeyField } from "@/components/url/custom-key-field";
import type { useShortenForm } from "@/hooks/use-shorten-form";

interface ShortenLinkFormProps {
	form: ReturnType<typeof useShortenForm>;
	/** Stacks the submit button below the fields (used inside the create dialog). */
	stacked?: boolean;
}

export function ShortenLinkForm({ form, stacked = false }: ShortenLinkFormProps) {
	const urlId = useId();
	const urlMessageId = useId();

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				form.submit();
			}}
			className={stacked ? "space-y-4" : "flex flex-col gap-4 md:flex-row md:items-end"}
		>
			<div className={stacked ? "space-y-4" : "flex-1 space-y-4"}>
				<div className="space-y-1.5">
					<label htmlFor={urlId} className="block text-[11px] font-medium">
						Destination URL
					</label>
					<div className="flex h-9 items-center border border-input bg-card px-2.5 focus-within:border-ring">
						<Link2 className="mr-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<input
							id={urlId}
							type="url"
							required
							placeholder="https://example.com/a/very/long/path"
							value={form.url}
							onChange={(event) => form.setUrl(event.target.value)}
							disabled={form.isShortening}
							aria-invalid={!!form.urlError}
							aria-describedby={form.urlError ? urlMessageId : undefined}
							className="w-full min-w-0 border-none bg-transparent text-xs outline-none placeholder:text-muted-foreground"
						/>
					</div>
					{form.urlError ? (
						<p id={urlMessageId} role="alert" className="text-[11px] text-destructive">
							{form.urlError}
						</p>
					) : null}
				</div>

				<CustomKeyField
					value={form.customKey}
					onChange={form.onCustomKeyChange}
					error={form.customKeyError}
					disabled={form.isShortening}
					onRegenerate={form.regenerateCustomKey}
				/>
			</div>

			<Button
				type="submit"
				disabled={!form.canSubmit}
				className={`${stacked ? "w-full" : "md:w-auto"} shrink-0 cursor-pointer disabled:cursor-not-allowed`}
			>
				{form.isShortening ? "Shortening..." : "Shorten Link"}
				{form.isShortening ? (
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
				) : (
					<Zap className="size-4" aria-hidden="true" />
				)}
			</Button>
		</form>
	);
}
