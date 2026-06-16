import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUrlsByUserId } from "@/lib/services/url.service";

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const urls = await getUrlsByUserId(session.user.id);
	return NextResponse.json(urls);
}
