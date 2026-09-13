import { auth } from "@/lib/auth";
import { getCustomKeyValidationError, normalizeCustomKey } from "@/lib/services/keygen";
import {
	UrlKeyAlreadyExistsError,
	type UrlPatch,
	patchUrlByIdAndUserId,
	softDeleteUrlByIdAndUserId,
} from "@/lib/services/url.service";
import { isUrlReachable } from "@/lib/services/validator";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const numericId = Number(id);
	if (!Number.isInteger(numericId)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	const { url, expiresAt, key: rawKey, isActive } = await request.json();

	// Every field below crosses the trust boundary, so each is type-checked before
	// reaching the query builder — the TypeScript types are compile-time only.
	if (expiresAt !== undefined && expiresAt !== null && typeof expiresAt !== "string") {
		return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
	}

	if (isActive !== undefined && typeof isActive !== "boolean") {
		return NextResponse.json({ error: "Invalid isActive" }, { status: 400 });
	}

	if (rawKey !== undefined && typeof rawKey !== "string") {
		return NextResponse.json({ error: "Invalid key" }, { status: 400 });
	}

	if (url !== undefined && typeof url !== "string") {
		return NextResponse.json({ error: "Invalid url" }, { status: 400 });
	}

	const patch: UrlPatch = {};

	if (url !== undefined) {
		const reachable = await isUrlReachable(url);
		if (!reachable) return NextResponse.json({ error: "URL is not reachable" }, { status: 400 });
		patch.targetUrl = url;
		// `expiresAt` only travels with a destination change from the edit dialog,
		// and an absent value there means "clear the expiry".
		patch.expiresAt = expiresAt ?? null;
	} else if (expiresAt !== undefined) {
		patch.expiresAt = expiresAt;
	}

	if (rawKey !== undefined) {
		const key = normalizeCustomKey(rawKey);
		const keyError = getCustomKeyValidationError(key);
		if (keyError) return NextResponse.json({ error: keyError }, { status: 400 });
		patch.key = key;
	}

	if (isActive !== undefined) {
		patch.isActive = isActive;
	}

	try {
		const result = await patchUrlByIdAndUserId(numericId, session.user.id, patch);
		if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof UrlKeyAlreadyExistsError) {
			return NextResponse.json({ error: "Key already exists" }, { status: 409 });
		}
		throw error;
	}
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const numericId = Number(id);
	if (!Number.isInteger(numericId)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	const result = await softDeleteUrlByIdAndUserId(numericId, session.user.id);
	if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ deleted: { id: result.id, key: result.key } });
}
