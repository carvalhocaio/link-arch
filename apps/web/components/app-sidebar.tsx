"use client";

import { APP_VERSION } from "@/lib/version";
import { LayoutDashboard, Link2, LinkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { data: session, isLoading } = useSession();
	const pathname = usePathname();

	const items: Array<{
		label: string;
		href: string;
		icon: React.ComponentType<{ className?: string }>;
	}> = [
		{
			label: "Dashboard",
			href: "/dashboard",
			icon: LayoutDashboard,
		},
		{
			label: "My Links",
			href: "/my-links",
			icon: LinkIcon,
		},
	] as const;

	return (
		<Sidebar variant="inset" collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
							<div className="flex aspect-square size-8 items-center justify-center bg-primary text-primary-foreground">
								<Link2 className="size-4" aria-hidden="true" />
							</div>
							<div className="grid flex-1 text-left leading-tight">
								<span className="truncate font-semibold">LinkArch</span>
								<span className="truncate text-muted-foreground">v{APP_VERSION}</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										isActive={pathname === item.href}
										tooltip={item.label}
										render={<Link href={item.href} />}
									>
										<item.icon aria-hidden="true" />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				{isLoading ? (
					<div className="flex items-center gap-2 p-2">
						<Skeleton className="h-8 w-8 rounded-lg" />
						<div className="flex-1 group-data-[collapsible=icon]:hidden">
							<Skeleton className="mb-1 h-3.5 w-24" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
				) : session ? (
					<NavUser
						user={{
							name: session.user.name,
							email: session.user.email,
						}}
					/>
				) : null}
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
