import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createShortUrl, UrlKeyAlreadyExistsError } from "@/lib/services/url.service";
import { isUrlReachable } from "@/lib/services/validator";
import { normalizeCustomKey, getCustomKeyValidationError } from "@/lib/services/keygen";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { url, key: rawKey } = body;

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
