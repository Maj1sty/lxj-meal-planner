const CACHE_PREFIX = "lxj-meal-planner-";
const CACHE_NAME = `${CACHE_PREFIX}v0.3.0`;
const APP_SHELL_PATHS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./src/styles.css",
  "./src/app.js",
  "./src/core/calorie-goal.js",
  "./src/data/foods.js",
  "./src/data/report-foods.generated.js",
  "./src/core/nutrition.js",
];

function appShellUrls() {
  return APP_SHELL_PATHS.map(
    (path) => new URL(path, self.registration.scope).href,
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(appShellUrls()))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cache.match(request)
      ?? cache.match(new URL("./index.html", self.registration.scope).href);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  const networkResponse = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse ?? networkResponse;
}

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  const scopeUrl = new URL(self.registration.scope);

  if (event.request.method !== "GET" || requestUrl.origin !== scopeUrl.origin) {
    return;
  }

  event.respondWith(
    event.request.mode === "navigate"
      ? networkFirst(event.request)
      : staleWhileRevalidate(event.request),
  );
});
