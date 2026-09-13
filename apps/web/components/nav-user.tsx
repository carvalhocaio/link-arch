"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
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
		image?: string | null;
	};
}) {
	const router = useRouter();
	const { isMobile } = useSidebar();
	const signOut = useSignOut();

	const initials = getInitials(user.name);

	// The provider avatar (Google) is decorative here: the name sits right beside it.
	const avatar = (
		<Avatar className="size-8">
			{user.image ? <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" /> : null}
			<AvatarFallback>{initials}</AvatarFallback>
		</Avatar>
	);

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
						{avatar}
						<div className="grid flex-1 text-left text-xs leading-tight">
							<span className="truncate font-medium">{user.name}</span>
							<span className="truncate text-muted-foreground">{user.email}</span>
						</div>
						<ChevronsUpDown className="ml-auto size-4" aria-hidden="true" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="min-w-56"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						{/* Base UI throws if a GroupLabel has no Group ancestor, unlike Radix.
						    Grouping also makes the label genuinely name what it sits above. */}
						<DropdownMenuGroup>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left">
									{avatar}
									<div className="grid flex-1 text-left text-xs leading-tight">
										<span className="truncate font-medium">{user.name}</span>
										<span className="truncate text-muted-foreground">{user.email}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleSignOut}>
								<LogOut aria-hidden="true" />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
