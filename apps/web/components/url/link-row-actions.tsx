"use client";

import { Copy, Edit3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteUrlAction } from "@/components/url/delete-url-action";
import type { ActivityItem } from "@/lib/activity";

interface LinkRowActionsProps {
	activity: ActivityItem;
	onCopy: (activity: ActivityItem) => void;
	onEdit: (activity: ActivityItem) => void;
	onDelete: (activity: ActivityItem) => void;
	isDeleting: boolean;
}

/** Copy / Edit / Delete cluster shown on each link row. */
export function LinkRowActions({
	activity,
	onCopy,
	onEdit,
	onDelete,
	isDeleting,
}: LinkRowActionsProps) {
	return (
		<div className="flex items-center gap-0.5">
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={`Copy ${activity.slug}`}
				onClick={() => onCopy(activity)}
			>
				<Copy className="size-4" aria-hidden="true" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={`Edit ${activity.slug}`}
				onClick={() => onEdit(activity)}
			>
				<Edit3 className="size-4" aria-hidden="true" />
			</Button>
			<DeleteUrlAction
				onConfirm={() => onDelete(activity)}
				isPending={isDeleting}
				ariaLabel={`Delete ${activity.slug}`}
			/>
		</div>
	);
}
