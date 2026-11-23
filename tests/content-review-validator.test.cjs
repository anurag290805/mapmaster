const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const corpusRoot = path.resolve(__dirname, "../candidate/content-review");

test("offline validator produces deterministic source-integrity and approval-separated report", async () => {
  const { validateCorpus } = await import("../tools/content-review/validate.mjs");
  const first = await validateCorpus(corpusRoot);
  const second = await validateCorpus(corpusRoot);

  assert.deepEqual(first, second);
  assert.deepEqual(first.source_integrity, {
    geonames: "valid",
    opentdb: "valid",
    wikidata: "valid",
  });
  assert.deepEqual(first.technical_validation, {
    accepted: 100,
    pending_validation: 0,
    rejected: 0,
  });
  assert.deepEqual(first.human_content_approval, {
    pending_review: 100,
  });
  assert.deepEqual(first.gameplay_approval, {
    not_approved: 100,
  });
  assert.deepEqual(first.review_disposition, {
    accepted: 0,
    pending_review: 100,
    rejected: 0,
  });
});

test("offline validator refuses a technically valid record that loses its candidate-only gameplay block", async () => {
  const { summarizeRecords } = await import("../tools/content-review/validate.mjs");
  assert.throws(
    () => summarizeRecords([{ source_id: "Q1", technical_validation: "accepted", human_content_approval: "pending_review", gameplay_approval: "approved" }]),
    /gameplay-blocked/i,
  );
});
