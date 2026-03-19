"use client";

import { Check, ClipboardCopy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ShortenResponse } from "@/lib/api";

interface ShortenResultProps {
	data: ShortenResponse;
}

function CopyButton({ value, label }: { value: string; label: string }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		toast.success(`${label} copied to clipboard`);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<Button variant="outline" size="icon" onClick={handleCopy} title={`Copy ${label}`}>
			{copied ? <Check /> : <ClipboardCopy />}
		</Button>
	);
}

export function ShortenResult({ data }: ShortenResultProps) {
	return (
		<Card className="surface-floating ghost-border shadow-none">
			<CardHeader className="pb-2">
				<CardTitle>Short URL Ready</CardTitle>
				<CardDescription>Your link is created. Copy it or open it now.</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-2">
					<Input
						readOnly
						value={data.shortUrl}
						className="ghost-border h-10 flex-1 truncate bg-card font-mono text-xs"
					/>
					<CopyButton value={data.shortUrl} label="Short URL" />
					<Button variant="outline" size="icon" asChild>
						<a
							href={data.shortUrl}
							target="_blank"
							rel="noopener noreferrer"
							title="Open short URL"
						>
							<ExternalLink />
						</a>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
