"use client";

import { RefreshCw } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { shortHost } from "@/lib/activity";

const KEY_HELP = "Allowed: 3-32 chars, lowercase letters, numbers, and hyphens.";

interface CustomKeyFieldProps {
	value: string;
	onChange: (value: string) => void;
	error?: string | null;
	disabled?: boolean;
	label?: string;
	/** Omit to hide the regenerate button (the edit dialog has no use for it). */
	onRegenerate?: () => void;
}

/**
 * The `<host>/<key>` input group. Shared by the dashboard form, the my-links
 * create dialog and the edit dialog, which previously carried three drifting
 * copies of this markup.
 */
export function CustomKeyField({
	value,
	onChange,
	error,
	disabled,
	label = "Short key",
	onRegenerate,
}: CustomKeyFieldProps) {
	const inputId = useId();
	const messageId = useId();

	return (
		<div className="space-y-1.5">
			<label htmlFor={inputId} className="block text-[11px] font-medium">
				{label}
			</label>
			<div className="flex h-9 items-center gap-2 border border-input bg-card px-2.5 focus-within:border-ring">
				<span className="shrink-0 text-[11px] text-muted-foreground">{shortHost()}/</span>
				<input
					id={inputId}
					type="text"
					placeholder="custom-key"
					value={value}
					onChange={(event) => onChange(event.target.value.toLowerCase())}
					disabled={disabled}
					aria-invalid={!!error}
					aria-describedby={messageId}
					className="w-full min-w-0 border-none bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground"
				/>
				{onRegenerate ? (
					<Button
						type="button"
						variant="ghost"
						size="xs"
						onClick={onRegenerate}
						disabled={disabled}
						className="shrink-0"
					>
						<RefreshCw className="size-3" aria-hidden="true" />
						<span className="hidden sm:inline">Regenerate</span>
					</Button>
				) : null}
			</div>
			<p
				id={messageId}
				role={error ? "alert" : undefined}
				className={`text-[11px] ${error ? "text-destructive" : "text-muted-foreground"}`}
			>
				{error ?? KEY_HELP}
			</p>
		</div>
	);
}
