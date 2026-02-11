"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistration - Registers the service worker for PWA support
 * This enables offline functionality and the install prompt on mobile devices
 */
export function ServiceWorkerRegistration() {
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Only register in production or if explicitly enabled
		if ("serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("/sw.js")
					.then((registration) => {
						console.log("SW registered:", registration.scope);
					})
					.catch((error) => {
						console.log("SW registration failed:", error);
					});
			});
		}
	}, []);

	return null;
}
