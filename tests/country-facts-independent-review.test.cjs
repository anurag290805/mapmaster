const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("independent-review overlay preserves the 194 frozen identities and candidate isolation", async () => {
  const baseline = await import(
    path.join(root, "candidate/country-facts/catalog.v1.mjs")
  );
  const review = await import(
    path.join(root, "candidate/country-facts/independent-review.v1.mjs")
  );

  assert.equal(review.COUNTRY_FACT_INDEPENDENT_REVIEW.length, 194);
  assert.deepEqual(
    review.COUNTRY_FACT_INDEPENDENT_REVIEW.map((record) => record.canonical_id),
    baseline.COUNTRY_FACT_CATALOG.map((record) => record.canonical_id),
  );
  assert.ok(
    review.COUNTRY_FACT_INDEPENDENT_REVIEW.every(
      (record) => record.source_snapshot_hash,
    ),
  );
  assert.ok(
    review.COUNTRY_FACT_INDEPENDENT_REVIEW.every((record) =>
      record.content_hash.startsWith("fnv1a32:"),
    ),
  );
  assert.ok(
    review.COUNTRY_FACT_INDEPENDENT_REVIEW.every(
      (record) => record.founder_approval === "pending_founder_approval",
    ),
  );
  assert.ok(
    review.COUNTRY_FACT_INDEPENDENT_REVIEW.every(
      (record) => record.gameplay_approval === "not_approved",
    ),
  );
  assert.ok(
    review.COUNTRY_FACT_INDEPENDENT_REVIEW.every(
      (record) => record.production_eligible === false,
    ),
  );
});

test("independent-review validation rejects unsupported evidence and premature production eligibility", async () => {
  const review = await import(
    path.join(root, "candidate/country-facts/independent-review.v1.mjs")
  );
  const [first] = review.COUNTRY_FACT_INDEPENDENT_REVIEW;
  const invalid = {
    ...first,
    independent_evidence: {
      ...first.independent_evidence,
      direct_evidence: "",
    },
    production_eligible: true,
  };
  const result = review.validateIndependentReviewLedger({
    records: [invalid],
    expectedCatalog: [first],
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("direct evidence")));
  assert.ok(
    result.errors.some((error) => error.includes("Candidate isolation")),
  );
});

test("final-resolution v2 corrects Gambia's Factbook GEC/FIPS lookup without promoting any candidate", async () => {
  const resolution = await import(
    path.join(root, "candidate/country-facts/final-resolution.v2.mjs")
  );
  const gambia = resolution.COUNTRY_FACT_FINAL_RESOLUTION_V2.find(
    (record) => record.canonical_id === "mapmaster:country:gambia",
  );

  assert.equal(gambia.independent_evidence.source_code, "ga");
  assert.equal(gambia.independent_evidence.source_path, "africa/ga.json");
  assert.equal(
    gambia.independent_evidence.source_field,
    "Geography.Terrain.text",
  );
  assert.equal(
    gambia.independent_evidence.direct_evidence,
    "flood plain of the Gambia River flanked by some low hills",
  );
  assert.equal(
    gambia.source_identity_status,
    "corrected_mapmaster_name_to_factbook_gec_fips",
  );
  assert.equal(gambia.founder_approval, "pending_founder_approval");
  assert.equal(gambia.gameplay_approval, "not_approved");
  assert.equal(gambia.production_eligible, false);
});

test("final-resolution v2 keeps Palestine policy-blocked and preserves the 194 candidate identities", async () => {
  const baseline = await import(
    path.join(root, "candidate/country-facts/catalog.v1.mjs")
  );
  const resolution = await import(
    path.join(root, "candidate/country-facts/final-resolution.v2.mjs")
  );
  const palestine = resolution.COUNTRY_FACT_FINAL_RESOLUTION_V2.find(
    (record) => record.canonical_id === "mapmaster:country:palestine",
  );

  assert.equal(resolution.COUNTRY_FACT_FINAL_RESOLUTION_V2.length, 194);
  assert.deepEqual(
    resolution.COUNTRY_FACT_FINAL_RESOLUTION_V2.map(
      (record) => record.canonical_id,
    ),
    baseline.COUNTRY_FACT_CATALOG.map((record) => record.canonical_id),
  );
  assert.equal(palestine.review_outcome, "NEEDS_REVIEW");
  assert.equal(
    palestine.policy_status,
    "policy_blocked_scope_and_entity_definition",
  );
  assert.equal(palestine.founder_approval, "pending_founder_approval");
  assert.equal(palestine.production_eligible, false);
  assert.equal(resolution.validateFinalResolutionV2().valid, true);
});

test("final-remediation v3 makes the high-priority factual holds explicit without changing candidate isolation", async () => {
  const remediation = await import(
    path.join(root, "candidate/country-facts/final-remediation.v3.mjs")
  );
  const held = new Set(
    remediation.COUNTRY_FACT_FINAL_REMEDIATION_V3.filter(
      (record) => record.review_outcome === "NEEDS_REVIEW",
    ).map((record) => record.canonical_id),
  );

  for (const id of [
    "mapmaster:country:bangladesh",
    "mapmaster:country:myanmar",
    "mapmaster:country:saudi-arabia",
    "mapmaster:country:zambia",
  ]) {
    assert.ok(
      held.has(id),
      `${id} must remain held while current evidence conflicts or is incomplete`,
    );
  }
  assert.equal(
    remediation.FINAL_REMEDIATION_V3_COUNTS.editorially_recommended,
    162,
  );
  assert.equal(remediation.FINAL_REMEDIATION_V3_COUNTS.needs_review, 32);
  assert.equal(remediation.validateFinalRemediationV3().valid, true);
  assert.ok(
    remediation.COUNTRY_FACT_FINAL_REMEDIATION_V3.every(
      (record) =>
        record.founder_approval === "pending_founder_approval" &&
        record.gameplay_approval === "not_approved" &&
        record.production_eligible === false &&
        record.development_preview_only === true,
    ),
  );
});

test("final-remediation v3 supplies elevation units and preserves the approved China and Micronesia v2 wording", async () => {
  const previous = await import(
    path.join(root, "candidate/country-facts/final-resolution.v2.mjs")
  );
  const remediation = await import(
    path.join(root, "candidate/country-facts/final-remediation.v3.mjs")
  );
  const byId = new Map(
    remediation.COUNTRY_FACT_FINAL_REMEDIATION_V3.map((record) => [
      record.canonical_id,
      record,
    ]),
  );
  const previousById = new Map(
    previous.COUNTRY_FACT_FINAL_RESOLUTION_V2.map((record) => [
      record.canonical_id,
      record,
    ]),
  );

  assert.match(
    byId.get("mapmaster:country:ecuador").final_proposed_fact,
    /6,267 m\./,
  );
  assert.match(
    byId.get("mapmaster:country:greece").final_proposed_fact,
    /2,917 m\./,
  );
  for (const id of [
    "mapmaster:country:china",
    "mapmaster:country:micronesia",
  ]) {
    assert.equal(
      byId.get(id).final_proposed_fact,
      previousById.get(id).final_proposed_fact,
    );
    assert.equal(byId.get(id).content_hash, previousById.get(id).content_hash);
  }
});
