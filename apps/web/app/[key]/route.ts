import { NextResponse } from "next/server";
import { findByKey, incrementClicks } from "@/lib/services/url.service";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ key: string }> },
) {
	const { key } = await params;
	const url = await findByKey(key);
	if (!url || !url.isActive) {
		return NextResponse.json({ error: "Short URL not found" }, { status: 404 });
	}
	await incrementClicks(url.id);
	return NextResponse.redirect(url.targetUrl, 302);
}
