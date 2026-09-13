import { type ShortenPayload, shortenUrl } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useShortenUrl() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ShortenPayload) => shortenUrl(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["my-urls"] });
		},
	});
}
