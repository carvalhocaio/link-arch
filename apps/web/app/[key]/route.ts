import { after } from "next/server";
import { NextResponse } from "next/server";
import { findByKey, incrementClicks } from "@/lib/services/url.service";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ key: string }> },
) {
	try {
		const { key } = await params;
		const url = await findByKey(key);
		if (!url) {
			return NextResponse.json({ error: "Short URL not found" }, { status: 404 });
		}
		try {
			after(() => incrementClicks(url.id));
		} catch {
			void incrementClicks(url.id);
		}
		return NextResponse.redirect(url.targetUrl, 302);
	} catch {
		return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
	}
}
