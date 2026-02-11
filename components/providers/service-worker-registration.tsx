"use client";

import { useEffect } from "react";

/**
 * Clears all service workers and caches - use this to fix broken SW issues
 * Run this in console: clearServiceWorkers()
 */
export function clearServiceWorkers() {
	if (typeof window === "undefined") return;

	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			for (const registration of registrations) {
				registration.unregister();
				console.log("[SW] Unregistered:", registration.scope);
			}
		});
	}

	if ("caches" in window) {
		caches.keys().then((cacheNames) => {
			for (const cacheName of cacheNames) {
				caches.delete(cacheName);
				console.log("[SW] Cache deleted:", cacheName);
			}
		});
	}

	console.log("[SW] All service workers and caches cleared!");
	console.log("[SW] Please reload the page");
}

// Make it available globally for console debugging
if (typeof window !== "undefined") {
	(window as any).clearServiceWorkers = clearServiceWorkers;
}

/**
 * ServiceWorkerRegistration - Registers the service worker for PWA support
 * This enables offline functionality and the install prompt on mobile devices
 */
export function ServiceWorkerRegistration() {
	useEffect(() => {
		if (typeof window === "undefined") return;

		if ("serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("/sw.js")
					.then((registration) => {
						console.log("SW registered:", registration.scope);

						// Check for updates
						registration.addEventListener("updatefound", () => {
							const newWorker = registration.installing;
							if (newWorker) {
								newWorker.addEventListener("statechange", () => {
									if (
										newWorker.state === "installed" &&
										navigator.serviceWorker.controller
									) {
										// New version available, skip waiting to activate immediately
										newWorker.postMessage({ type: "SKIP_WAITING" });
									}
								});
							}
						});
					})
					.catch((error) => {
						console.log("SW registration failed:", error);
					});

				// Listen for controller change (new SW activated)
				navigator.serviceWorker.addEventListener("controllerchange", () => {
					console.log("SW controller changed");
				});
			});
		}
	}, []);

	return null;
}
