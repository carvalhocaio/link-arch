import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface DashboardShellProps {
	title: string;
	children: React.ReactNode;
}

export function DashboardShell({ title, children }: DashboardShellProps) {
	return (
		<SidebarProvider>
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground"
			>
				Skip to content
			</a>
			<AppSidebar />
			<SidebarInset className="bg-background">
				<AppTopbar title={title} />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
