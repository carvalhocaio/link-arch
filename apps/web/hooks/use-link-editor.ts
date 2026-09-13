"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useDeleteMyUrl } from "@/hooks/use-delete-my-url";
import { usePatchMyUrl } from "@/hooks/use-patch-my-url";
import type { ActivityItem } from "@/lib/activity";
import type { AdminUrl } from "@/lib/api";
import { toDateInputValueFromUtc } from "@/lib/expiry";
import { getCustomKeyValidationError, isValidUrl, normalizeCustomKey } from "@/lib/url";

/**
 * Shared edit/delete state for a link, used by both the dashboard and the
 * my-links page.
 */
export function useLinkEditor(myUrlsById: Map<number, AdminUrl>) {
	const { mutate: patchUrl, isPending: isSaving } = usePatchMyUrl();
	const { mutate: deleteUrl, isPending: isDeleting } = useDeleteMyUrl();

	const [activity, setActivity] = useState<ActivityItem | null>(null);
	const [url, setUrl] = useState("");
	const [key, setKey] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [expiresOn, setExpiresOn] = useState("");

	const normalizedKey = normalizeCustomKey(key);
	const keyError = getCustomKeyValidationError(normalizedKey);

	function close() {
		setActivity(null);
		setUrl("");
		setKey("");
		setIsActive(true);
		setExpiresOn("");
	}

	function open(next: ActivityItem) {
		const current = myUrlsById.get(next.id);
		setActivity(next);
		setUrl(next.targetUrl);
		setKey(current?.key ?? next.key);
		setIsActive(current?.isActive ?? true);
		setExpiresOn(toDateInputValueFromUtc(current?.expiresAt));
	}

	function onOpenChange(open: boolean) {
		if (!open) {
			close();
		}
	}

	function save() {
		if (!activity) {
			return;
		}

		const normalizedUrl = url.trim();
		const current = myUrlsById.get(activity.id);
		const currentIsActive = current?.isActive ?? true;
		const currentExpiresOn = toDateInputValueFromUtc(current?.expiresAt);

		const statusChanged = currentIsActive !== isActive;
		const keyChanged = normalizedKey !== activity.key;
		const urlChanged = normalizedUrl !== activity.targetUrl;
		const expiryChanged = currentExpiresOn !== expiresOn;

		if (!statusChanged && !keyChanged && !urlChanged && !expiryChanged) {
			toast.message("No changes to save");
			return;
		}

		if (!isValidUrl(normalizedUrl)) {
			toast.error("Please enter a valid URL");
			return;
		}

		if (keyError) {
			toast.error(keyError);
			return;
		}

		patchUrl(
			{
				id: activity.id,
				...(urlChanged || expiryChanged
					? { url: normalizedUrl, expiresAt: expiresOn || null }
					: {}),
				...(keyChanged ? { key: normalizedKey } : {}),
				...(statusChanged ? { isActive } : {}),
			},
			{
				onSuccess: () => {
					toast.success("Link updated");
					close();
				},
				onError: (error) => toast.error(error.message),
			},
		);
	}

	function remove(target: ActivityItem) {
		deleteUrl(
			{ id: target.id },
			{
				onSuccess: () => toast.success("Link deleted"),
				onError: (error) => toast.error(error.message),
			},
		);
	}

	return {
		activity,
		open,
		onOpenChange,
		save,
		remove,
		url,
		setUrl,
		key,
		setKey,
		keyError,
		isActive,
		setIsActive,
		expiresOn,
		setExpiresOn,
		isSaving,
		isDeleting,
	};
}
