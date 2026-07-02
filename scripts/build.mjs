import { cp, mkdir, rm } from "node:fs/promises";

const output = "dist";

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });

await Promise.all([
  cp("index.html", `${output}/index.html`),
  cp("service-worker.js", `${output}/service-worker.js`),
  cp("manifest.webmanifest", `${output}/manifest.webmanifest`),
  cp("assets", `${output}/assets`, { recursive: true }),
  cp("src", `${output}/src`, { recursive: true }),
  cp("docs", `${output}/docs`, { recursive: true }),
]);

console.log("Static site built in dist/.");
