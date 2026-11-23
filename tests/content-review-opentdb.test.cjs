const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const response = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/content-review/opentdb-response.json"), "utf8"),
);

test("OpenTDB adapter builds five deterministic geography batch requests", async () => {
  const { buildOpenTdbUrl, buildBatchRequests } = await import("../tools/content-review/opentdb.mjs");
  assert.equal(buildOpenTdbUrl("token-1"), "https://opentdb.com/api.php?amount=10&category=22&encode=url3986&token=token-1");
  assert.deepEqual(buildBatchRequests("token-1").map((request) => request.batch), [1, 2, 3, 4, 5]);
});

test("OpenTDB normalization decodes choices, has no fictional source ID, and flags policy wording", async () => {
  const { normalizeOpenTdbBatches } = await import("../tools/content-review/opentdb.mjs");
  const output = normalizeOpenTdbBatches({
    batches: [{ batch: 1, response }],
    retrieved_at: "2026-11-09T00:00:00.000Z",
  });
  const record = output.records[0];
  assert.equal(record.source_id, null);
  assert.equal(record.source_id_type, "not_provided_by_source");
  assert.equal(record.question, "Which country contains the city of Mumbai?");
  assert.deepEqual(record.choices, ["India", "Nepal", "Sri Lanka", "Bhutan"]);
  assert.equal(record.technical_validation, "accepted");
  assert.equal(record.human_content_approval, "pending_review");
  assert.equal(record.gameplay_approval, "not_approved");
  assert.equal(record.source_fingerprint.length, 64);
  assert.ok(record.review_flags.includes("requires_geographic_policy_review"));
});

test("OpenTDB normalization rejects duplicate question fingerprints and malformed options", async () => {
  const { normalizeOpenTdbBatches } = await import("../tools/content-review/opentdb.mjs");
  const duplicate = normalizeOpenTdbBatches({
    batches: [{ batch: 1, response }, { batch: 2, response }],
    retrieved_at: "2026-11-09T00:00:00.000Z",
  });
  assert.equal(duplicate.records[1].technical_validation, "rejected");
  assert.ok(duplicate.records[1].validation_errors.includes("duplicate_source_fingerprint"));
  const malformed = normalizeOpenTdbBatches({
    batches: [{ batch: 1, response: { ...response, results: [{ ...response.results[0], incorrect_answers: ["India"] }] } }],
    retrieved_at: "2026-11-09T00:00:00.000Z",
  });
  assert.equal(malformed.records[0].technical_validation, "rejected");
  assert.ok(malformed.records[0].validation_errors.includes("duplicate_choice"));
});
