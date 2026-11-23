const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const v1Path = path.join(root, "candidate/content-review/release-prep/first-geography-release.v1.json");
const v2Path = path.join(root, "candidate/content-review/release-prep/first-geography-release.v2.json");

test("v2 preserves v1 identities and applies the approved revision split", () => {
  const v1Text = fs.readFileSync(v1Path, "utf8");
  const v1 = JSON.parse(v1Text);
  const v2 = JSON.parse(fs.readFileSync(v2Path, "utf8"));
  assert.equal(v2.supersedes, "first-geography-release.v1.json");
  assert.equal(v2.superseded_manifest_sha256, crypto.createHash("sha256").update(v1Text).digest("hex"));
  assert.deepEqual(
    new Set(v2.records.map((record) => record.proposal_id)),
    new Set(v1.records.map((record) => record.proposal_id)),
  );
  assert.equal(v2.records.filter((record) => record.change_type === "unchanged").length, 13);
  assert.equal(v2.records.filter((record) => record.change_type === "revised").length, 37);
  assert.equal(v2.records.filter((record) => record.recommended_content_decision === "BLOCKED_FOR_CONTENT_REVISION").length, 0);
  for (const record of v2.records) {
    assert.equal(record.approval_state, "pending_founder_approval");
    assert.equal(record.production_eligible, false);
    assert.equal(record.player_facing.answer.length > 0, true);
  }
});

test("v2 removes coordinate-memorization questions and keeps answers quality-safe", () => {
  const v2 = JSON.parse(fs.readFileSync(v2Path, "utf8"));
  for (const record of v2.records.filter((item) => item.use === "city_challenge")) {
    assert.doesNotMatch(record.player_facing.prompt, /-?\d+\.\d+\s*,\s*-?\d+\.\d+/);
    assert.equal(record.player_facing.choices.includes(record.player_facing.answer), true);
    assert.equal(new Set(record.player_facing.choices).size, record.player_facing.choices.length);
    assert.ok(record.editorial_evidence.some((evidence) => evidence.role === "country-code mapping"));
  }
  for (const record of v2.records.filter((item) => item.use === "feature_learning")) {
    assert.equal(record.player_facing.format, "learning_card");
    assert.doesNotMatch(record.player_facing.prompt, /-?\d+\.\d+\s*,\s*-?\d+\.\d+/);
    assert.match(record.player_facing.display, /GeoNames/);
  }
});
