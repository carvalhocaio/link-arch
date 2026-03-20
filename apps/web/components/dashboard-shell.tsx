"use client";

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
			<AppSidebar />
			<SidebarInset className="surface-stage">
				<AppTopbar title={title} />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
