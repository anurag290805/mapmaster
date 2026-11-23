const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const prepPath = path.join(root, "candidate/content-review/release-prep");
const v2Path = path.join(prepPath, "first-geography-release.v2.json");
const v3Path = path.join(prepPath, "first-geography-release.v3.json");

test("v3 is an evidence-pinned candidate overlay that preserves every v2 identity", async () => {
  const v2Text = fs.readFileSync(v2Path, "utf8");
  const v2 = JSON.parse(v2Text);
  const v3 = JSON.parse(fs.readFileSync(v3Path, "utf8"));
  const { applyReleaseRevision, prepareReleasePreview } = await import(
    "../pilot/external-content-release-prep-core.mjs"
  );

  assert.equal(v3.base_manifest, "first-geography-release.v2.json");
  assert.equal(
    v3.base_manifest_sha256,
    crypto.createHash("sha256").update(v2Text).digest("hex"),
  );
  const records = applyReleaseRevision(v2.records, v3);
  assert.equal(records.length, 50);
  assert.deepEqual(
    new Set(records.map((record) => record.proposal_id)),
    new Set(v2.records.map((record) => record.proposal_id)),
  );
  assert.equal(prepareReleasePreview(records).approvalChecklist.pending, 50);
  for (const record of records) {
    assert.equal(record.approval_state, "pending_founder_approval");
    assert.equal(record.production_eligible, false);
    assert.equal(
      record.frozen_evidence,
      v2.records.find((base) => base.proposal_id === record.proposal_id).frozen_evidence,
    );
  }
  assert.equal(v2.attribution.geonames.required, true);
  assert.match(v2.attribution.geonames.notice, /GeoNames, CC BY 4\.0/);
});

test("v3 makes only evidence-backed editorial changes without treating review status as approval", async () => {
  const v2 = JSON.parse(fs.readFileSync(v2Path, "utf8"));
  const v3 = JSON.parse(fs.readFileSync(v3Path, "utf8"));
  const { applyReleaseRevision } = await import("../pilot/external-content-release-prep-core.mjs");
  const records = applyReleaseRevision(v2.records, v3);
  const countries = records.filter((record) => record.use === "country_explorer");
  const cities = records.filter((record) => record.use === "city_challenge");
  const features = records.filter((record) => record.use === "feature_learning");

  assert.equal(v3.editorial_verdict.approve_as_written_proposal_ids.length, 18);
  assert.equal(
    v3.editorial_verdict.approve_as_written_proposal_ids.every((proposalId) =>
      countries.some((record) => record.proposal_id === proposalId),
    ),
    true,
  );
  const japan = countries.find((record) => record.source_id === "Q17");
  assert.equal(japan.player_facing.answer, "Tokyo");
  assert.doesNotMatch(japan.player_facing.display, /reviewed source/i);
  assert.match(japan.player_facing.display, /1943/i);
  const indonesia = countries.find((record) => record.source_id === "Q252");
  assert.equal(indonesia.competitive_eligible, false);
  assert.match(indonesia.player_facing.prompt, /as of 2026-11-10/i);
  assert.equal(indonesia.latest_status_checked_at, "2026-11-10");

  assert.equal(cities.length, 15);
  assert.equal(new Set(cities.map((record) => record.clue_type)).size >= 4, true);
  for (const city of cities) {
    assert.doesNotMatch(city.player_facing.prompt, /reviewed city/i);
    assert.equal(city.player_facing.choices.includes(city.player_facing.answer), true);
    assert.equal(new Set(city.player_facing.choices).size, city.player_facing.choices.length);
    assert.ok(city.editorial_evidence.some((evidence) => evidence.role === "independent city-country evidence"));
  }

  assert.equal(features.length, 15);
  for (const feature of features) {
    assert.match(feature.player_facing.display, /GeoNames classifies/i);
    assert.ok(feature.player_facing.learning_fact);
    assert.ok(feature.editorial_evidence.some((evidence) => evidence.role === "independent learning fact"));
  }
  assert.equal(records.some((record) => record.source === "opentdb"), false);
});

test("v3 preview loads only the base plus candidate revision overlay", () => {
  const preview = fs.readFileSync(path.join(root, "pilot/external-content-preview.mjs"), "utf8");
  assert.match(preview, /first-geography-release\.v3\.json/);
  assert.match(preview, /applyReleaseRevision/);
  assert.match(preview, /Independent evidence/);
  assert.doesNotMatch(preview, /opentdb-geography|renderTrivia/);
});
