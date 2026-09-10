// =====================================
// Amader Elaka - Service Worker
// =====================================

const CACHE_VERSION = "v1";
const CACHE_NAME = `amader-elaka-${CACHE_VERSION}`;

// Same-origin static assets to pre-cache on install
const PRECACHE_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./css/premium.css",
    "./js/pwa.js",
    "./js/script.js",
    "./js/mobile-nav.js",
    "./js/location-data.js",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// Install: pre-cache core assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

// Fetch: network-first for navigation, cache-first for static assets
self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches
                        .open(CACHE_NAME)
                        .then((cache) => cache.put(request, responseClone));
                    return response;
                })
                .catch(() =>
                    caches
                        .match(request)
                        .then((cached) => cached || caches.match("./index.html"))
                )
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request).then((response) => {
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches
                        .open(CACHE_NAME)
                        .then((cache) => cache.put(request, responseClone));
                }
                return response;
            });
        })
    );
});
