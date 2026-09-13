"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";

interface LinkFaviconProps {
	src: string | null;
	className?: string;
}

/**
 * Favicon for a link's destination, falling back to a generic icon when the
 * host has none or the request fails. Decorative: the adjacent link text
 * already names the destination.
 */
export function LinkFavicon({ src, className }: LinkFaviconProps) {
	const [failed, setFailed] = useState(false);

	return (
		<span className={`flex size-4 shrink-0 items-center justify-center ${className ?? ""}`}>
			{src && !failed ? (
				<img
					src={src}
					alt=""
					width={16}
					height={16}
					loading="lazy"
					decoding="async"
					referrerPolicy="no-referrer"
					onError={() => setFailed(true)}
					className="size-full object-contain"
				/>
			) : (
				<Link2 className="size-3.5 text-muted-foreground/80" aria-hidden="true" />
			)}
		</span>
	);
}
