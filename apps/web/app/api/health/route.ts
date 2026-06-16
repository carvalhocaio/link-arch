import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";

export function GET() {
	return NextResponse.json({
		title: "Link Arch",
		version: APP_VERSION,
		description: "A fast, lightweight link management platform.",
		author: "https://github.com/carvalhocaio",
		repository: "https://github.com/carvalhocaio/link-arch",
	});
}
