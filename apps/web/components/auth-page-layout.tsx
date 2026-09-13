import type { ReactNode } from "react";

interface AuthPageLayoutProps {
	children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-10">
			<main id="main-content" className="w-full max-w-md">
				{children}
			</main>
		</div>
	);
}
