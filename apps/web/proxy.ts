import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "better-auth.session_token";

const protectedRoutes = ["/"];
const authRoutes = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);

	const isProtectedRoute = protectedRoutes.some((route) => pathname === route);
	const isAuthRoute = authRoutes.some((route) => pathname === route);

	// Redirect unauthenticated users to sign-in
	if (isProtectedRoute && !sessionCookie) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}

	// Redirect authenticated users away from auth pages
	if (isAuthRoute && sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/sign-in", "/sign-up"],
};
