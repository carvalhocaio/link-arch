"use client";

import { Check, Copy, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ShortUrlResultProps {
	shortUrl: string;
	copied: boolean;
	onCopy: () => void;
	actionsClassName?: string;
	inputClassName?: string;
}

export function ShortUrlResult({
	shortUrl,
	copied,
	onCopy,
	actionsClassName = "grid grid-cols-2 gap-2",
	inputClassName = "ghost-border h-10 bg-card font-mono text-xs",
}: ShortUrlResultProps) {
	return (
		<div className="space-y-3">
			<Input readOnly value={shortUrl} className={inputClassName} />
			<div className={actionsClassName}>
				<Button variant="outline" onClick={onCopy} className="cursor-pointer">
					{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
					{copied ? "Copied" : "Copy"}
				</Button>
				<Button variant="outline" asChild className="cursor-pointer">
					<a href={shortUrl} target="_blank" rel="noopener noreferrer">
						Open
						<ExternalLink className="size-4" />
					</a>
				</Button>
			</div>
		</div>
	);
}
