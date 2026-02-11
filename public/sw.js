/// <reference lib="webworker" />

const CACHE_NAME = "workout-timer-v1";
const STATIC_ASSETS = [
	"/",
	"/manifest.json",
	"/icon.svg",
	"/icon-192x192.png",
	"/icon-512x512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
	console.log("[SW] Installing...");
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("[SW] Caching static assets");
			return cache.addAll(STATIC_ASSETS);
		}),
	);
	self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	console.log("[SW] Activating...");
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name)),
			);
		}),
	);
	self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
	// Skip non-GET requests
	if (event.request.method !== "GET") {
		return;
	}

	// Skip API calls and authentication
	if (
		event.request.url.includes("/api/") ||
		event.request.url.includes("clerk") ||
		event.request.url.includes("_next")
	) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((response) => {
			// Return cached response or fetch from network
			return (
				response ||
				fetch(event.request).then((fetchResponse) => {
					// Cache new requests that are static assets
					if (
						fetchResponse.ok &&
						(fetchResponse.headers.get("content-type")?.includes("image") ||
							fetchResponse.headers.get("content-type")?.includes("json"))
					) {
						const responseClone = fetchResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseClone);
						});
					}
					return fetchResponse;
				})
			);
		}),
	);
});
