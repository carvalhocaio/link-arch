import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUrlKeyByIdAndUserId, UrlKeyAlreadyExistsError } from "@/lib/services/url.service";
import { normalizeCustomKey, getCustomKeyValidationError } from "@/lib/services/keygen";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const { key: rawKey } = await request.json();

	const key = normalizeCustomKey(rawKey);
	const err = getCustomKeyValidationError(key);
	if (err) return NextResponse.json({ error: err }, { status: 400 });

	try {
		const result = await updateUrlKeyByIdAndUserId(Number(id), session.user.id, key);
		if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json(result);
	} catch (e) {
		if (e instanceof UrlKeyAlreadyExistsError) {
			return NextResponse.json({ error: "Key already exists" }, { status: 409 });
		}
		throw e;
	}
}
