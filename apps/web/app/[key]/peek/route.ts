import { NextResponse } from "next/server";
import { findByKey } from "@/lib/services/url.service";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ key: string }> },
) {
	const { key } = await params;
	const url = await findByKey(key);
	if (!url) {
		return NextResponse.json({ error: "Short URL not found" }, { status: 404 });
	}
	return NextResponse.json({
		key: url.key,
		targetUrl: url.targetUrl,
		clicks: url.clicks,
		createdAt: url.createdAt,
	});
}
