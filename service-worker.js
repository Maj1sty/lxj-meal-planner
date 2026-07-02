const CACHE_PREFIX = "lxj-meal-planner-";
const CACHE_VERSION = "v0.3.1";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const APP_SHELL_PATHS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  `./src/styles.css?version=${CACHE_VERSION}`,
  `./src/app.js?version=${CACHE_VERSION}`,
  `./src/core/calorie-goal.js?version=${CACHE_VERSION}`,
  `./src/data/foods.js?version=${CACHE_VERSION}`,
  `./src/data/report-foods.generated.js?version=${CACHE_VERSION}`,
  `./src/core/nutrition.js?version=${CACHE_VERSION}`,
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
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.mode === "navigate") {
      return cache.match(new URL("./index.html", self.registration.scope).href);
    }

    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  const scopeUrl = new URL(self.registration.scope);

  if (event.request.method !== "GET" || requestUrl.origin !== scopeUrl.origin) {
    return;
  }

  event.respondWith(networkFirst(event.request));
});
