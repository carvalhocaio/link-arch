"use client";

import { ArrowRight, Link2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { AuthLegalFooter } from "@/components/auth-legal-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useSignIn } from "@/hooks/use-sign-in";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
	const router = useRouter();
	const signIn = useSignIn();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	function handleSubmit(e: FormEvent) {
		e.preventDefault();

		signIn.mutate(
			{ email, password },
			{
				onSuccess: () => {
					toast.success("Welcome back!");
					router.push("/");
				},
				onError: (error) => {
					toast.error(error.message);
				},
			},
		);
	}

	return (
		<div className={cn("flex flex-col gap-4", className)} {...props}>
			<Card className="surface-floating ghost-border gap-0 bg-card/95 py-0 shadow-[var(--air-shadow)]">
				<CardHeader className="space-y-2 border-b border-border/40 py-6">
					<div className="flex items-center gap-2 text-primary">
						<Link2 className="size-4" />
						<span className="text-sm font-semibold">LinkArch</span>
					</div>
					<CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
					<CardDescription>Enter your email to sign in.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5 py-6">
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={signIn.isPending}
									className="ghost-border h-10 bg-card"
								/>
							</Field>
							<Field>
								<div className="flex items-center justify-between gap-2">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<span className="invisible text-xs text-muted-foreground">Forgot password?</span>
								</div>
								<PasswordInput
									id="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={signIn.isPending}
									className="ghost-border h-10 bg-card"
								/>
							</Field>
							<Field>
								<Button type="submit" className="h-10 w-full" disabled={signIn.isPending}>
									{signIn.isPending ? (
										<>
											<Loader2 className="animate-spin" />
											Signing in...
										</>
									) : (
										<>
											Sign In
											<ArrowRight className="size-3.5" />
										</>
									)}
								</Button>
							</Field>
						</FieldGroup>
					</form>

					<FieldDescription className="text-center text-xs">
						Don&apos;t have an account?{" "}
						<Link
							href="/sign-up"
							className="font-medium text-foreground underline-offset-4 hover:underline"
						>
							Sign up
						</Link>
					</FieldDescription>
				</CardContent>
			</Card>

			<AuthLegalFooter />
		</div>
	);
}
