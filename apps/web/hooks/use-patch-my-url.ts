import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type PatchMyUrlPayload, patchMyUrl } from "@/lib/api";

/**
 * Applies every changed field of a link in one request. Replaces the former
 * url/key/status hooks, which chained up to three PATCHes and three refetches
 * for a single "Save changes" click.
 */
export function usePatchMyUrl() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: PatchMyUrlPayload) => patchMyUrl(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["my-urls"] });
		},
	});
}
