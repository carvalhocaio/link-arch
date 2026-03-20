import type { ReactNode } from "react";

interface AuthPageLayoutProps {
	children: ReactNode;
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
	return (
		<div className="surface-stage relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6 md:p-10">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_22%,rgb(82_163_43_/_14%),transparent_34%),radial-gradient(circle_at_92%_2%,rgb(95_94_97_/_8%),transparent_30%)]" />
			<div className="relative w-full max-w-md md:max-w-lg">{children}</div>
		</div>
	);
}
