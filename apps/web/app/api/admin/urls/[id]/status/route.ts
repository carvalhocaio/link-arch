import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateUrlStatusByIdAndUserId } from "@/lib/services/url.service";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const { isActive } = await request.json();

	const result = await updateUrlStatusByIdAndUserId(Number(id), session.user.id, isActive);
	if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(result);
}
