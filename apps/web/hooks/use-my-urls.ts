import { useQuery } from "@tanstack/react-query";

import { getMyUrls } from "@/lib/api";

export function useMyUrls() {
	return useQuery({
		queryKey: ["my-urls"],
		queryFn: getMyUrls,
		retry: false,
		staleTime: 60 * 1000,
	});
}
