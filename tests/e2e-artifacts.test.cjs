const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const test = require("node:test");

test("E2E preparation creates independent root and subpath preview artifacts", () => {
  execFileSync("npm", ["run", "build:e2e"], {
    cwd: resolve(__dirname, ".."),
    stdio: "pipe",
  });

  const rootIndex = readFileSync(resolve(__dirname, "../dist-e2e-root/index.html"), "utf8");
  const subpathIndex = readFileSync(
    resolve(__dirname, "../dist-e2e-subpath/index.html"),
    "utf8",
  );

  assert.match(rootIndex, /src="\.\/assets\//);
  assert.match(subpathIndex, /src="\/mapmaster\/assets\//);
});
