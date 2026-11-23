const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const corpus = path.join(root, "candidate", "content-review");

function json(relative) {
  return JSON.parse(fs.readFileSync(path.join(corpus, relative), "utf8"));
}

test("completion cursor contains every immutable source identity exactly once", () => {
  const cursor = json("reports/REVIEW_CURSOR.json");
  const wikidata = json("normalized/wikidata.v1.json").records.map((record) => record.source_id);
  const geonames = json("normalized/geonames.v1.json").records.map((record) => record.source_id);
  const opentdb = json("normalized/opentdb-geography.v1.json").records.map((record) => record.source_fingerprint);

  assert.equal(cursor.completed_records, 100);
  assert.equal(cursor.remaining_records, 0);
  assert.deepEqual(new Set(cursor.reviewed_identity_set.wikidata), new Set(wikidata));
  assert.deepEqual(new Set(cursor.reviewed_identity_set.geonames), new Set(geonames));
  assert.deepEqual(new Set(cursor.reviewed_identity_set.opentdb), new Set(opentdb));
  assert.equal(cursor.reviewed_identity_set.wikidata.length, wikidata.length);
  assert.equal(cursor.reviewed_identity_set.geonames.length, geonames.length);
  assert.equal(cursor.reviewed_identity_set.opentdb.length, opentdb.length);
  assert.equal(cursor.next_unreviewed.wikidata, null);
  assert.equal(cursor.next_unreviewed.geonames, null);
  assert.equal(cursor.next_unreviewed.opentdb, null);
});

test("completion evidence retains the candidate-only boundary and exact analyst totals", () => {
  const evidence = fs.readFileSync(path.join(corpus, "reports/BATCH_5_COMPLETION_EVIDENCE.md"), "utf8");
  assert.match(evidence, /\*\*66\*\*/);
  assert.match(evidence, /\*\*29\*\*/);
  assert.match(evidence, /\*\*5\*\*/);
  assert.match(evidence, /human_content_approval: pending_review/);
  assert.match(evidence, /gameplay_approval: not_approved/);
});

test("founder policy re-evaluation advances factual review without approving human or gameplay status", () => {
  const reEvaluation = fs.readFileSync(
    path.join(corpus, "reports/FOUNDER_POLICY_REEVALUATION.md"),
    "utf8",
  );
  assert.match(reEvaluation, /\*\*88\*\*/);
  assert.match(reEvaluation, /\*\*7\*\*/);
  assert.match(reEvaluation, /\*\*5\*\*/);
  assert.match(reEvaluation, /human-content approval remains `pending_review`/);
  assert.match(reEvaluation, /gameplay approval remains `not_approved`/);
  for (const heldRecord of [
    "0538db6a74c2",
    "3fe4eda24297",
    "600c0c8e58da",
    "86742f0baee",
    "86d8fcf8d222",
    "233a529a2731",
    "d4e8a3eed4ca",
  ]) {
    assert.match(reEvaluation, new RegExp(heldRecord));
  }
});
