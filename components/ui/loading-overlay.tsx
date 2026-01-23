"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLoadingContext } from "@/components/providers/loading-context";

const LOADING_DELAY_MS = 300;
const NAVIGATION_DELAY_MS = 100;

export function LoadingOverlay() {
	const isFetching = useIsFetching();
	const isMutating = useIsMutating();
	const pathname = usePathname();
	const { isLoading: checkLoading } = useLoadingContext();
	const [showLoader, setShowLoader] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const [prevPathname, setPrevPathname] = useState(pathname);

	const reactQueryLoading = isFetching > 0 || isMutating > 0;
	const manualLoading =
		checkLoading("templates") ||
		checkLoading("shared-timer") ||
		checkLoading("navigation");

	useEffect(() => {
		if (pathname !== prevPathname && prevPathname) {
			setPrevPathname(pathname);
			const timer = setTimeout(() => {
				setIsNavigating(false);
			}, NAVIGATION_DELAY_MS);
			return () => clearTimeout(timer);
		} else if (!prevPathname) {
			setPrevPathname(pathname);
		}
	}, [pathname, prevPathname]);

	const isLoading = reactQueryLoading || manualLoading || isNavigating;

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		if (isLoading) {
			timeoutId = setTimeout(() => {
				setShowLoader(true);
			}, LOADING_DELAY_MS);
		} else {
			setShowLoader(false);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, [isLoading]);

	if (!showLoader) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
			<div className="flex flex-col items-center gap-4">
				<div className="relative">
					<div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
					<div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
						<Loader2 className="size-8 animate-spin text-primary" />
					</div>
				</div>
				<p className="text-sm font-medium text-muted-foreground">Loading...</p>
			</div>
		</div>
	);
}
