"use client";

import { ArrowRight, Link2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useSignUp } from "@/hooks/use-sign-up";
import { cn } from "@/lib/utils";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
	const router = useRouter();
	const signUp = useSignUp();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");

	const passwordMismatch = passwordConfirmation.length > 0 && password !== passwordConfirmation;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();

		if (password !== passwordConfirmation) {
			toast.error("Passwords do not match");
			return;
		}

		signUp.mutate(
			{ name, email, password, passwordConfirmation },
			{
				onSuccess: () => {
					toast.success("Account created successfully!");
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
					<CardTitle className="text-2xl tracking-tight">Create an account</CardTitle>
					<CardDescription>Enter your details to get started.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-5 py-6">
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="name">Full Name</FieldLabel>
								<Input
									id="name"
									type="text"
									placeholder="John Doe"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={signUp.isPending}
									className="ghost-border h-10 bg-card"
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={signUp.isPending}
									className="ghost-border h-10 bg-card"
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<PasswordInput
									id="password"
									required
									minLength={8}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={signUp.isPending}
									className="ghost-border h-10 bg-card"
								/>
								<FieldDescription className="text-xs">
									Must be at least 8 characters long.
								</FieldDescription>
							</Field>
							<Field>
								<FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
								<PasswordInput
									id="confirm-password"
									required
									minLength={8}
									value={passwordConfirmation}
									onChange={(e) => setPasswordConfirmation(e.target.value)}
									disabled={signUp.isPending}
									aria-invalid={passwordMismatch || undefined}
									className="ghost-border h-10 bg-card"
								/>
								{passwordMismatch && (
									<p className="text-xs text-destructive">Passwords do not match.</p>
								)}
							</Field>

							<Field>
								<Button
									type="submit"
									className="h-10 w-full"
									disabled={signUp.isPending || passwordMismatch}
								>
									{signUp.isPending ? (
										<>
											<Loader2 className="animate-spin" />
											Creating account...
										</>
									) : (
										<>
											Create Account
											<ArrowRight className="size-3.5" />
										</>
									)}
								</Button>
							</Field>
						</FieldGroup>
					</form>

					<FieldDescription className="text-center text-xs">
						Already have an account?{" "}
						<Link
							href="/sign-in"
							className="font-medium text-foreground underline-offset-4 hover:underline"
						>
							Sign in
						</Link>
					</FieldDescription>
				</CardContent>
			</Card>

			<div className="text-center text-xs text-muted-foreground">
				<p>
					&copy; {new Date().getFullYear()} LinkArch. Built by{" "}
					<a
						href="https://github.com/carvalhocaio"
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Caio Carvalho
					</a>
					.
				</p>
				<div className="mt-2 flex items-center justify-center gap-4">
					<Link href="/privacy" className="hover:text-foreground">
						Privacy
					</Link>
					<Link href="/terms" className="hover:text-foreground">
						Terms
					</Link>
				</div>
			</div>
		</div>
	);
}
