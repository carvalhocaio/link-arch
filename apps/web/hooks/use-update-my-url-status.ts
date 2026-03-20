import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type UpdateMyUrlStatusPayload, updateMyUrlStatus } from "@/lib/api";

export function useUpdateMyUrlStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateMyUrlStatusPayload) => updateMyUrlStatus(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["my-urls"] });
		},
	});
}
