import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/login", "/privacy", "/terms"],
				// Authenticated surfaces, the API, and every generated short link
				// (which lives at the route root) should stay out of the index.
				disallow: ["/api/", "/dashboard", "/my-links"],
			},
		],
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
