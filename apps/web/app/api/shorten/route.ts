import { auth } from "@/lib/auth";
import { getCustomKeyValidationError, normalizeCustomKey } from "@/lib/services/keygen";
import { UrlKeyAlreadyExistsError, createShortUrl } from "@/lib/services/url.service";
import { isUrlReachable } from "@/lib/services/validator";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const proto = request.headers.get("x-forwarded-proto") ?? "http";
	const host = request.headers.get("host") ?? "localhost:3001";
	const BASE_URL = `${proto}://${host}`;

	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { url, key: rawKey } = body;

	if (typeof url !== "string") {
		return NextResponse.json({ error: "Invalid url" }, { status: 400 });
	}

	if (rawKey !== undefined && rawKey !== null && typeof rawKey !== "string") {
		return NextResponse.json({ error: "Invalid key" }, { status: 400 });
	}

	let customKey: string | undefined;
	if (rawKey) {
		customKey = normalizeCustomKey(rawKey);
		const err = getCustomKeyValidationError(customKey);
		if (err) return NextResponse.json({ error: err }, { status: 400 });
	}

	const reachable = await isUrlReachable(url);
	if (!reachable) return NextResponse.json({ error: "URL is not reachable" }, { status: 400 });

	try {
		const result = await createShortUrl(url, session.user.id, customKey);
		return NextResponse.json({
			shortUrl: `${BASE_URL}/${result.key}`,
			key: result.key,
			targetUrl: result.targetUrl,
			createdAt: result.createdAt,
		});
	} catch (e) {
		if (e instanceof UrlKeyAlreadyExistsError) {
			return NextResponse.json({ error: "Key already exists" }, { status: 409 });
		}
		throw e;
	}
}
