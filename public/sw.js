const CACHE_NAME = "workout-timer-v2";

// Only cache actual static assets, not dynamic pages
const STATIC_ASSETS = [
	"/manifest.json",
	"/icon.svg",
	"/icon-192x192.png",
	"/icon-512x512.png",
	"/apple-icon.png",
];

// Install event - cache static assets only
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

// Listen for messages from the client
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

// Fetch event - network first for pages, cache first for static assets
self.addEventListener("fetch", (event) => {
	// Skip non-GET requests
	if (event.request.method !== "GET") {
		return;
	}

	const url = new URL(event.request.url);

	// Skip API calls and authentication
	if (
		url.pathname.startsWith("/api/") ||
		event.request.url.includes("clerk") ||
		url.pathname.startsWith("/_next/")
	) {
		return;
	}

	// Check if this is a static asset we want to cache
	const isStaticAsset =
		STATIC_ASSETS.includes(url.pathname) ||
		url.pathname.match(/\.(png|svg|json|ico|woff2?)$/);

	if (isStaticAsset) {
		// For static assets: cache first, network fallback
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				if (cachedResponse) {
					return cachedResponse;
				}
				return fetch(event.request).then((fetchResponse) => {
					if (fetchResponse.ok) {
						const responseClone = fetchResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseClone);
						});
					}
					return fetchResponse;
				});
			}),
		);
	} else {
		// For dynamic pages: network first, no caching
		// This lets Next.js handle SSR properly
		return;
	}
});
