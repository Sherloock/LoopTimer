"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoadingContext } from "./loading-context";

export function NavigationTracker() {
	const pathname = usePathname();
	const { setLoading } = useLoadingContext();

	useEffect(() => {
		setLoading("navigation", false);
	}, [pathname, setLoading]);

	return null;
}
