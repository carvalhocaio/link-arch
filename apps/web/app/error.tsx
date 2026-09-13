"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function RouteError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
			<p className="text-[10px] font-semibold tracking-[0.2em] text-destructive uppercase">Error</p>
			<h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
			<p className="max-w-sm text-xs text-muted-foreground">
				An unexpected error occurred. Try again, and if it keeps happening the service may be
				temporarily unavailable.
			</p>
			<Button onClick={reset}>Try again</Button>
		</main>
	);
}
