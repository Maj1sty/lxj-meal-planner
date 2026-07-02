import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../service-worker.js", import.meta.url),
  "utf8",
);
const appSource = await readFile(
  new URL("../src/app.js", import.meta.url),
  "utf8",
);
const indexSource = await readFile(
  new URL("../index.html", import.meta.url),
  "utf8",
);

test("service worker precaches the complete application shell", () => {
  for (const asset of [
    "./index.html",
    "./manifest.webmanifest",
    "./src/styles.css",
    "./src/app.js",
    "./src/core/calorie-goal.js",
    "./src/data/foods.js",
    "./src/data/report-foods.generated.js",
    "./src/core/nutrition.js",
  ]) {
    assert.match(source, new RegExp(asset.replaceAll(".", "\\.")));
  }
});

test("service worker handles install, activate, fetch, and offline navigation", () => {
  assert.match(source, /addEventListener\("install"/);
  assert.match(source, /addEventListener\("activate"/);
  assert.match(source, /addEventListener\("fetch"/);
  assert.match(source, /request\.mode === "navigate"/);
  assert.match(source, /cache\.match\(new URL\("\.\/index\.html"/);
});

test("service worker only intercepts same-origin GET requests", () => {
  assert.match(source, /event\.request\.method !== "GET"/);
  assert.match(source, /requestUrl\.origin !== scopeUrl\.origin/);
});

test("service worker fetches current assets before falling back to offline cache", () => {
  assert.doesNotMatch(source, /staleWhileRevalidate/);
  assert.match(source, /event\.respondWith\(networkFirst\(event\.request\)\)/);
  assert.match(source, /return Response\.error\(\)/);
});

test("service worker updates bypass caches and activate without a manual reload", () => {
  assert.match(appSource, /updateViaCache: "none"/);
  assert.match(appSource, /registration\.update\(\)/);
  assert.match(appSource, /addEventListener\("controllerchange"/);
  assert.match(appSource, /window\.location\.reload\(\)/);
});

test("version-critical browser resources use the current cache-busting version", () => {
  assert.match(indexSource, /src\/app\.js\?version=v0\.3\.1/);
  assert.match(indexSource, /src\/styles\.css\?version=v0\.3\.1/);
  assert.match(appSource, /data\/foods\.js\?version=v0\.3\.1/);
  assert.match(source, /CACHE_VERSION = "v0\.3\.1"/);
});
