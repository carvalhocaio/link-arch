"use client";

import { useEffect, useState } from "react";

/** Delays propagating a fast-changing value, e.g. a search box's text. */
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(timer);
	}, [value, delayMs]);

	return debounced;
}
