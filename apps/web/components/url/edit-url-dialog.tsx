"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface EditUrlDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	url: string;
	onUrlChange: (value: string) => void;
	isActive: boolean;
	onIsActiveChange: (value: boolean) => void;
	onSave: () => void;
	isPending: boolean;
}

export function EditUrlDialog({
	open,
	onOpenChange,
	url,
	onUrlChange,
	isActive,
	onIsActiveChange,
	onSave,
	isPending,
}: EditUrlDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit destination URL</DialogTitle>
					<DialogDescription>Update where this short link redirects.</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<Input
						type="url"
						value={url}
						onChange={(event) => onUrlChange(event.target.value)}
						placeholder="https://example.com/path"
						disabled={isPending}
						className="ghost-border h-10 bg-card text-xs"
					/>
					<div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
						<div>
							<p className="text-sm font-medium">Link active</p>
							<p className="text-xs text-muted-foreground">
								Disable to stop redirects for this link.
							</p>
						</div>
						<Switch checked={isActive} onCheckedChange={onIsActiveChange} disabled={isPending} />
					</div>
					<Button onClick={onSave} disabled={isPending} className="w-full cursor-pointer">
						{isPending ? "Saving..." : "Save changes"}
						{isPending ? <Loader2 className="size-4 animate-spin" /> : null}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
