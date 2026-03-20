import { toast } from "sonner";

export async function copyToClipboard(
	value: string,
	messages: { success?: string; error?: string } = {},
) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(messages.success ?? "Copied to clipboard");
		return true;
	} catch {
		toast.error(messages.error ?? "Failed to copy");
		return false;
	}
}
