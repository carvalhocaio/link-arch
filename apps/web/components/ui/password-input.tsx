"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
	const [showPassword, setShowPassword] = React.useState(false);

	return (
		<div className="relative">
			<input
				type={showPassword ? "text" : "password"}
				data-slot="input"
				className={cn(
					"h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 pr-9 text-base shadow-none transition-[color,box-shadow,border-color,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/24 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
					className,
				)}
				{...props}
			/>
			<button
				type="button"
				tabIndex={-1}
				className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground"
				onClick={() => setShowPassword((prev) => !prev)}
				aria-label={showPassword ? "Hide password" : "Show password"}
			>
				{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
			</button>
		</div>
	);
}

export { PasswordInput };
