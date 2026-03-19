import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type UpdateMyUrlPayload, updateMyUrl } from "@/lib/api";

export function useUpdateMyUrl() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateMyUrlPayload) => updateMyUrl(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["my-urls"] });
		},
	});
}
