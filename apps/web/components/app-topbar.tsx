"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppTopbarProps {
	title: string;
}

export function AppTopbar({ title }: AppTopbarProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	function toggleTheme() {
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}

	return (
		<header className="sticky top-0 z-20 border-b border-border bg-background">
			<div className="flex h-12 items-center justify-between gap-3 px-3 sm:px-4 md:px-8">
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<SidebarTrigger className="-ml-1" />
					<h1 className="truncate text-xs font-semibold tracking-tight">{title}</h1>
				</div>
				<Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
					{mounted && resolvedTheme === "dark" ? (
						<Sun className="size-4" aria-hidden="true" />
					) : (
						<Moon className="size-4" aria-hidden="true" />
					)}
				</Button>
			</div>
		</header>
	);
}
