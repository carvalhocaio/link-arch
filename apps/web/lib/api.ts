export interface ShortenResponse {
	shortUrl: string;
	key: string;
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
	expiresAt: string | null;
	createdAt: string;
}

export interface UpdateMyUrlPayload {
	id: number;
	url: string;
	expiresAt: string | null;
}

export interface UpdateMyUrlStatusPayload {
	id: number;
	isActive: boolean;
}

export interface UpdateMyUrlKeyPayload {
	id: number;
	key: string;
}

export interface DeleteMyUrlPayload {
	id: number;
}

export interface ShortenPayload {
	url: string;
	key?: string;
}

export async function shortenUrl(payload: ShortenPayload): Promise<ShortenResponse> {
	const response = await fetch("/api/shorten", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to shorten URL");
	}

	return response.json();
}

export async function peekUrl(key: string): Promise<PeekResponse> {
	const response = await fetch(`/${key}/peek`);

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to peek URL");
	}

	return response.json();
}

export async function getMyUrls(): Promise<AdminUrl[]> {
	const response = await fetch("/api/admin/urls");

	if (!response.ok) {
		throw new Error("Failed to load user URLs");
	}

	return response.json();
}

export async function updateMyUrl(payload: UpdateMyUrlPayload): Promise<AdminUrl> {
	const response = await fetch(`/api/admin/urls/${payload.id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url: payload.url, expiresAt: payload.expiresAt }),
	});

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to update URL");
	}

	return response.json();
}

export async function updateMyUrlStatus(payload: UpdateMyUrlStatusPayload): Promise<AdminUrl> {
	const response = await fetch(`/api/admin/urls/${payload.id}/status`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ isActive: payload.isActive }),
	});

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to update URL status");
	}

	return response.json();
}

export async function updateMyUrlKey(payload: UpdateMyUrlKeyPayload): Promise<AdminUrl> {
	const response = await fetch(`/api/admin/urls/${payload.id}/key`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ key: payload.key }),
	});

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to update URL key");
	}

	return response.json();
}

export async function deleteMyUrl(
	payload: DeleteMyUrlPayload,
): Promise<{ deleted: { id: number; key: string } }> {
	const response = await fetch(`/api/admin/urls/${payload.id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const error: ShortenErrorResponse = await response.json();
		throw new Error(error.error ?? "Failed to delete URL");
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

export interface SessionResponse {
	user: AuthUser;
	session: AuthSession;
}

export async function getSession(): Promise<SessionResponse> {
	const response = await fetch("/api/auth/get-session");

	if (!response.ok) {
		throw new Error("Not authenticated");
	}

	return response.json();
}

export async function signOut(): Promise<void> {
	const response = await fetch("/api/auth/sign-out", {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error("Failed to sign out");
	}
}
