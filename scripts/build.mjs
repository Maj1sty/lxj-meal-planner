import { cp, mkdir, rm } from "node:fs/promises";

const output = "dist";

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });

await Promise.all([
  cp("index.html", `${output}/index.html`),
  cp("src", `${output}/src`, { recursive: true }),
  cp("docs", `${output}/docs`, { recursive: true }),
]);

console.log("Static site built in dist/.");
