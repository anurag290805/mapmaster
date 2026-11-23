const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const corpusRoot = path.join(root, "candidate", "content-review");

test("a technically accepted review record remains human-pending and gameplay-blocked", async () => {
  const { createReviewStatus } = await import("../tools/content-review/shared.mjs");

  assert.deepEqual(createReviewStatus("accepted"), {
    technical_validation: "accepted",
    human_content_approval: "pending_review",
    gameplay_approval: "not_approved",
  });
  assert.throws(
    () => createReviewStatus("accepted", { gameplay_approval: "approved" }),
    /gameplay approval/i,
  );
});

test("candidate review corpus remains absent from a production build and service worker precache", () => {
  assert.ok(fs.existsSync(path.join(corpusRoot, "manifest.json")));
  const build = spawnSync("npm", ["run", "build"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);

  const distEntries = fs.readdirSync(path.join(root, "dist"), { recursive: true });
  assert.equal(
    distEntries.some((entry) => String(entry).includes("content-review")),
    false,
  );
  assert.equal(
    distEntries.some((entry) => String(entry).includes("external-content-preview")),
    false,
    "development-only preview modules must not be shipped",
  );
  assert.equal(
    fs.existsSync(path.join(root, "dist", "pilot", "external-content-preview.mjs")),
    false,
  );
  const worker = fs.readFileSync(path.join(root, "dist", "service-worker.js"), "utf8");
  assert.doesNotMatch(worker, /content-review/);
  assert.doesNotMatch(worker, /external-content-preview/);
});
