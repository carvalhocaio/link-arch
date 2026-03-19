import { type SignUpPayload, signUp } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useSignUp() {
	return useMutation({
		mutationFn: (payload: SignUpPayload) => signUp(payload),
	});
}
