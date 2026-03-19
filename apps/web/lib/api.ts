const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface ShortenResponse {
	shortUrl: string;
	key: string;
	secretKey: string;
	targetUrl: string;
	createdAt: string;
}

export interface ShortenErrorResponse {
	error: string;
}

export interface PeekResponse {
	key: string;
	targetUrl: string;
	clicks: number;
	createdAt: string;
}

export interface AdminUrl {
	id: number;
	key: string;
	targetUrl: string;
	clicks: number;
	isActive: boolean;
	createdAt: string;
}

export async function shortenUrl(url: string): Promise<ShortenResponse> {
	const response = await fetch(`${API_URL}/api/shorten`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ url }),
	});

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to shorten URL");
	}

	return response.json();
}

export async function peekUrl(key: string): Promise<PeekResponse> {
	const response = await fetch(`${API_URL}/${key}/peek`, {
		credentials: "include",
	});

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to peek URL");
	}

	return response.json();
}

export async function getMyUrls(): Promise<AdminUrl[]> {
	const response = await fetch(`${API_URL}/api/admin/urls`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to load user URLs");
	}

	return response.json();
}

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	image: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AuthSession {
	id: string;
	userId: string;
	token: string;
	expiresAt: string;
}

export interface AuthResponse {
	user: AuthUser;
	session: AuthSession;
}

export interface SignInPayload {
	email: string;
	password: string;
}

export interface SignUpPayload {
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
}

export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
	const response = await fetch(`${API_URL}/api/auth/sign-in`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error ?? "Invalid credentials");
	}

	return response.json();
}

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
	const response = await fetch(`${API_URL}/api/auth/sign-up`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error ?? "Failed to create account");
	}

	return response.json();
}

export interface SessionResponse {
	user: AuthUser;
	session: AuthSession;
}

export async function getSession(): Promise<SessionResponse> {
	const response = await fetch(`${API_URL}/api/auth/get-session`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Not authenticated");
	}

	return response.json();
}

export async function signOut(): Promise<void> {
	const response = await fetch(`${API_URL}/api/auth/sign-out`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to sign out");
	}
}
