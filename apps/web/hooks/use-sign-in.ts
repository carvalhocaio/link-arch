import { type SignInPayload, signIn } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useSignIn() {
	return useMutation({
		mutationFn: (payload: SignInPayload) => signIn(payload),
	});
}
