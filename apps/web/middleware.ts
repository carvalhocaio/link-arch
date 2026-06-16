import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const session =
		request.cookies.get("better-auth.session_token") ||
		request.cookies.get("__Secure-better-auth.session_token");

	if (session && pathname === "/login") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (!session && (pathname.startsWith("/dashboard") || pathname.startsWith("/my-links"))) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/login", "/dashboard", "/dashboard/:path*", "/my-links", "/my-links/:path*"],
};
