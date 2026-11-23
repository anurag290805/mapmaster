const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const releaseManifest = path.join(
  __dirname,
  "..",
  "candidate",
  "content-review",
  "release-prep",
  "first-geography-release.v1.json",
);

test("release preparation accepts only founder-pending Wikidata and GeoNames proposals", async () => {
  const { prepareReleasePreview } = await import(
    "../pilot/external-content-release-prep-core.mjs"
  );
  const records = [
    {
      proposal_id: "wikidata:Q16:capital",
      source: "wikidata",
      source_id: "Q16",
      approval_state: "pending_founder_approval",
      use: "country_explorer",
      player_facing: { prompt: "What is Canada's capital?", answer: "Ottawa" },
    },
    {
      proposal_id: "geonames:6094817:city",
      source: "geonames",
      source_id: "6094817",
      approval_state: "pending_founder_approval",
      use: "city_challenge",
      player_facing: { prompt: "Which city is at 45.41117, -75.69812?", answer: "Ottawa" },
    },
  ];

  const prepared = prepareReleasePreview(records);
  assert.equal(prepared.countryExplorer.length, 1);
  assert.equal(prepared.cityChallenges.length, 1);
  assert.equal(prepared.featureLearning.length, 0);
  assert.equal(prepared.approvalChecklist.pending, 2);
  assert.equal(prepared.approvalChecklist.bulkEligible, 2);
});

test("release preparation refuses OpenTDB, rejected, or pre-approved proposals", async () => {
  const { prepareReleasePreview } = await import(
    "../pilot/external-content-release-prep-core.mjs"
  );
  const base = {
    proposal_id: "geonames:1:city",
    source: "geonames",
    source_id: "1",
    approval_state: "pending_founder_approval",
    use: "city_challenge",
    player_facing: { prompt: "Which city?", answer: "Example" },
  };

  assert.throws(
    () => prepareReleasePreview([{ ...base, source: "opentdb" }]),
    /OpenTDB/i,
  );
  assert.throws(
    () => prepareReleasePreview([{ ...base, approval_state: "founder_approved" }]),
    /pending founder approval/i,
  );
  assert.throws(
    () => prepareReleasePreview([{ ...base, factual_classification: "rejected" }]),
    /rejected/i,
  );
});

test("release-preview selection is deterministic without reusing gameplay candidate selectors", async () => {
  const { selectReleasePreviewRecords } = await import(
    "../pilot/external-content-release-prep-core.mjs"
  );
  const records = [
    { proposal_id: "geonames:1:city" },
    { proposal_id: "geonames:2:city" },
    { proposal_id: "geonames:3:city" },
  ];
  assert.deepEqual(
    selectReleasePreviewRecords(records, "stable", 3),
    selectReleasePreviewRecords(records, "stable", 3),
  );
  assert.equal(selectReleasePreviewRecords(records, "stable", 1).length, 1);
});

test("first release manifest proposes all and only the reviewed Wikidata and GeoNames records", () => {
  const release = JSON.parse(fs.readFileSync(releaseManifest, "utf8"));
  const corpusManifest = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "candidate", "content-review", "manifest.json"),
      "utf8",
    ),
  );
  const previewModule = fs.readFileSync(
    path.join(__dirname, "..", "pilot", "external-content-preview.mjs"),
    "utf8",
  );
  const normalizedBySource = {
    wikidata: JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "candidate", "content-review", "normalized", "wikidata.v1.json"),
        "utf8",
      ),
    ).records,
    geonames: JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "candidate", "content-review", "normalized", "geonames.v1.json"),
        "utf8",
      ),
    ).records,
  };
  assert.equal(release.records.length, 50);
  assert.equal(
    release.records.filter((record) => record.source === "wikidata").length,
    20,
  );
  assert.equal(
    release.records.filter((record) => record.source === "geonames").length,
    30,
  );
  assert.equal(
    release.records.some((record) => record.source === "opentdb"),
    false,
  );
  for (const record of release.records) {
    assert.equal(record.approval_state, "pending_founder_approval");
    assert.equal(record.production_eligible, false);
    assert.equal(record.player_facing.answer.length > 0, true);
    assert.equal(
      release.attribution[record.source].required,
      corpusManifest.sources[record.source].attribution_required,
    );
    assert.equal(
      normalizedBySource[record.source].some(
        (sourceRecord) => String(sourceRecord.source_id) === String(record.source_id),
      ),
      true,
      `${record.proposal_id} must retain an existing normalized source identity`,
    );
  }
  assert.doesNotMatch(previewModule, /opentdb-geography|renderTrivia/);
});
