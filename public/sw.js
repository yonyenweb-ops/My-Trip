// Trip Money service worker: makes the app open and work with no internet.
// All trip data lives in localStorage, so only the app files need caching.

const CACHE = "trip-money-v1";
const PAGES = ["/", "/trips", "/trips/new"];
const PRECACHE = [...PAGES, "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];
const MAX_RSC_ENTRIES = 100;

// Cache the main pages plus every JS/CSS file they reference, so the app
// works offline even though the first visit loaded before this worker existed.
async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(PRECACHE);
  const assets = new Set();
  for (const page of PAGES) {
    const res = await cache.match(page);
    const html = res ? await res.text() : "";
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assets.add(m[0]);
  }
  await Promise.all([...assets].map((a) => cache.add(a).catch(() => {})));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// In-app navigation data (?_rsc=...) piles up over time; keep only the newest.
async function trim(cache) {
  const rsc = (await cache.keys()).filter((r) => new URL(r.url).searchParams.has("_rsc"));
  for (let i = 0; i < rsc.length - MAX_RSC_ENTRIES; i++) await cache.delete(rsc[i]);
}

async function put(request, response) {
  const cache = await caches.open(CACHE);
  await cache.put(request, response);
  await trim(cache);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Build files have content hashes in their names, so they never change: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) put(request, res.clone());
            return res;
          }),
      ),
    );
    return;
  }

  // Pages and everything else: use the network when online (so updates arrive),
  // fall back to the last cached copy when offline.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) event.waitUntil(put(request, res.clone()));
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(request, { ignoreVary: true });
        if (hit) return hit;
        if (request.mode === "navigate") {
          // A trip page never opened before: the same URL without the query, or the dashboard.
          return (
            (await caches.match(url.pathname, { ignoreVary: true, ignoreSearch: true })) ||
            (await caches.match("/", { ignoreVary: true })) ||
            Response.error()
          );
        }
        return Response.error();
      }),
  );
});
