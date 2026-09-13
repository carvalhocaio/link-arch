"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useShortenUrl } from "@/hooks/use-shorten-url";
import type { ShortenResponse } from "@/lib/api";
import { copyToClipboard } from "@/lib/clipboard";
import {
	generateSuggestedCustomKey,
	getCustomKeyValidationError,
	isValidUrl,
	normalizeCustomKey,
} from "@/lib/url";

const CUSTOM_KEY_CONFLICT_ERROR = "Custom URL key is already in use";

/**
 * Shared state for the "shorten a new link" form, used by both the dashboard
 * and the my-links page.
 */
export function useShortenForm() {
	const { mutate: shortenLink, isPending: isShortening } = useShortenUrl();
	const [url, setUrl] = useState("");
	const [customKey, setCustomKey] = useState(() => generateSuggestedCustomKey());
	const [isCustomKeyEdited, setIsCustomKeyEdited] = useState(false);
	const [createdLink, setCreatedLink] = useState<ShortenResponse | null>(null);
	const [copied, setCopied] = useState(false);

	const normalizedUrl = url.trim();
	const normalizedCustomKey = normalizeCustomKey(customKey);
	const isUrlValid = isValidUrl(normalizedUrl);
	const customKeyError = getCustomKeyValidationError(normalizedCustomKey);
	// Only complain about a malformed URL once the user has typed something.
	const urlError =
		normalizedUrl && !isUrlValid ? "Enter a full URL, including http:// or https://" : null;

	function resetCustomKeySuggestion() {
		setCustomKey(generateSuggestedCustomKey());
		setIsCustomKeyEdited(false);
	}

	function onCustomKeyChange(value: string) {
		setCustomKey(value.toLowerCase());
		setIsCustomKeyEdited(true);
	}

	function submitShortenRequest(key: string, allowRetry: boolean) {
		shortenLink(
			{ url: normalizedUrl, key },
			{
				onSuccess: (data) => {
					setCreatedLink(data);
					setCopied(false);
					setUrl("");
					resetCustomKeySuggestion();
					toast.success("Short URL created");
				},
				onError: (error) => {
					if (allowRetry && error.message === CUSTOM_KEY_CONFLICT_ERROR) {
						// The key was auto-suggested rather than chosen, so silently
						// picking another one is safe — but say so, since the user can
						// see the key change in front of them.
						const retryKey = generateSuggestedCustomKey();
						setCustomKey(retryKey);
						setIsCustomKeyEdited(false);
						toast.message("That key was taken — generated a new one");
						submitShortenRequest(retryKey, false);
						return;
					}

					toast.error(error.message);
				},
			},
		);
	}

	function submit() {
		if (!isUrlValid || !!customKeyError || isShortening) {
			return;
		}

		const effectiveKey = normalizedCustomKey || generateSuggestedCustomKey();
		if (!normalizedCustomKey) {
			setCustomKey(effectiveKey);
			setIsCustomKeyEdited(false);
		}

		submitShortenRequest(effectiveKey, !isCustomKeyEdited);
	}

	async function copyCreatedLink() {
		if (!createdLink) {
			return;
		}

		const wasCopied = await copyToClipboard(createdLink.shortUrl, {
			success: "Short URL copied to clipboard",
			error: "Failed to copy short URL",
		});

		if (wasCopied) {
			setCopied(true);
		}
	}

	function reset() {
		setCreatedLink(null);
		setCopied(false);
		setUrl("");
		resetCustomKeySuggestion();
	}

	return {
		url,
		setUrl,
		customKey,
		onCustomKeyChange,
		regenerateCustomKey: resetCustomKeySuggestion,
		customKeyError,
		urlError,
		isUrlValid,
		isShortening,
		createdLink,
		setCreatedLink,
		copied,
		submit,
		copyCreatedLink,
		reset,
		canSubmit: isUrlValid && !customKeyError && !isShortening,
	};
}
