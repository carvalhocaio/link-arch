"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useSignOut } from "@/hooks/use-sign-out";

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
	};
}) {
	const router = useRouter();
	const { isMobile } = useSidebar();
	const signOut = useSignOut();

	function handleSignOut() {
		signOut.mutate(undefined, {
			onSuccess: () => {
				router.push("/login");
			},
			onError: () => {
				toast.error("Failed to sign out");
			},
		});
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
							/>
						}
					>
						<Avatar className="size-8">
							<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-xs leading-tight">
							<span className="truncate font-medium">{user.name}</span>
							<span className="truncate text-muted-foreground">{user.email}</span>
						</div>
						<ChevronsUpDown className="ml-auto size-4" aria-hidden="true" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--anchor-width) min-w-56"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left">
								<Avatar className="size-8">
									<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-xs leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-muted-foreground">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
							<LogOut aria-hidden="true" />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
