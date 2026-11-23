const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/content-review/wikidata-response.json"), "utf8"),
);

test("Wikidata adapter builds an exact-QID deterministic SPARQL query", async () => {
  const { buildCountryQuery } = await import("../tools/content-review/wikidata.mjs");
  const query = buildCountryQuery({
    countries: [{ qid: "Q668", name: "India" }, { qid: "Q17", name: "Japan" }],
    properties: ["P36", "P37"],
  });

  assert.match(query, /VALUES \?country \{ wd:Q17 wd:Q668 \}/);
  assert.match(query, /VALUES \?property \{ wd:P36 wd:P37 \}/);
  assert.doesNotMatch(query, /India|Japan/);
});

test("Wikidata normalization preserves source statements, qualifiers and review separation", async () => {
  const { normalizeWikidataResponse } = await import("../tools/content-review/wikidata.mjs");
  const result = normalizeWikidataResponse({
    response: fixture,
    selection: {
      countries: [{ qid: "Q668", name: "India", region: "Asia" }],
      properties: ["P36", "P37", "P38"],
    },
    request_url: "https://query.wikidata.org/sparql?format=json&query=example",
    retrieved_at: "2026-11-09T00:00:00.000Z",
  });

  assert.equal(result.raw_sha256.length, 64);
  assert.equal(result.records.length, 1);
  const india = result.records[0];
  assert.equal(india.source_id, "Q668");
  assert.equal(india.technical_validation, "accepted");
  assert.equal(india.human_content_approval, "pending_review");
  assert.equal(india.gameplay_approval, "not_approved");
  assert.deepEqual(india.claims.P37.map((claim) => claim.value.id), ["Q1103", "Q1860"]);
  assert.deepEqual(india.claims.P36[0].qualifiers, [{
    property: "P580",
    value: "+1911-12-12T00:00:00Z",
    value_type: "literal",
    datatype: "http://www.w3.org/2001/XMLSchema#dateTime",
  }]);
  assert.deepEqual(india.review_flags.sort(), [
    "missing_core_property:P38",
    "multiple_claims:P37",
  ]);
});
