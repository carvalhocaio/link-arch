import { signOut } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useSignOut() {
	return useMutation({
		mutationFn: signOut,
	});
}
