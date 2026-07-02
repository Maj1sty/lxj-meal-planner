import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../service-worker.js", import.meta.url),
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
  assert.match(source, /event\.request\.mode === "navigate"/);
  assert.match(source, /cache\.match\(new URL\("\.\/index\.html"/);
});

test("service worker only intercepts same-origin GET requests", () => {
  assert.match(source, /event\.request\.method !== "GET"/);
  assert.match(source, /requestUrl\.origin !== scopeUrl\.origin/);
});
