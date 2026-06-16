import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
	updateUrlByIdAndUserId,
	softDeleteUrlByIdAndUserId,
} from "@/lib/services/url.service";
import { isUrlReachable } from "@/lib/services/validator";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const { url, expiresAt } = await request.json();

	const reachable = await isUrlReachable(url);
	if (!reachable) return NextResponse.json({ error: "URL is not reachable" }, { status: 400 });

	const result = await updateUrlByIdAndUserId(
		Number(id),
		session.user.id,
		url,
		expiresAt ?? null,
	);
	if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(result);
}

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const result = await softDeleteUrlByIdAndUserId(Number(id), session.user.id);
	if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ deleted: { id: result.id, key: result.key } });
}
