"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useId } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShortUrlResultProps {
	shortUrl: string;
	copied: boolean;
	onCopy: () => void;
}

export function ShortUrlResult({ shortUrl, copied, onCopy }: ShortUrlResultProps) {
	const inputId = useId();

	return (
		<div className="space-y-3">
			<label htmlFor={inputId} className="block text-[11px] font-medium">
				Your short URL
			</label>
			<Input id={inputId} readOnly value={shortUrl} className="bg-card" />
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				<Button variant="outline" onClick={onCopy}>
					{copied ? (
						<Check className="size-4" aria-hidden="true" />
					) : (
						<Copy className="size-4" aria-hidden="true" />
					)}
					{copied ? "Copied" : "Copy"}
				</Button>
				<a
					href={shortUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={buttonVariants({ variant: "outline" })}
				>
					Open
					<ExternalLink className="size-4" aria-hidden="true" />
				</a>
			</div>
		</div>
	);
}
