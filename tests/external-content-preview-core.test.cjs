const assert = require("node:assert/strict");
const test = require("node:test");

test("preview data stays blocked unless every candidate status is still non-live", async () => {
  const { previewRecords } = await import("../pilot/external-content-preview-core.mjs");
  const records = [
    { source_id: "Q1", technical_validation: "accepted", human_content_approval: "pending_review", gameplay_approval: "not_approved" },
  ];

  assert.deepEqual(previewRecords(records), records);
  assert.throws(
    () => previewRecords([{ ...records[0], gameplay_approval: "approved" }]),
    /candidate-only/i,
  );
});

test("preview selection is deterministic, seed-scoped, and never mutates source records", async () => {
  const { selectPreviewQuestions } = await import("../pilot/external-content-preview-core.mjs");
  const questions = "a,b,c,d,e".split(",").map((source_fingerprint, index) => ({
      source_fingerprint,
      question: `Question ${index}`,
      technical_validation: "accepted",
      human_content_approval: "pending_review",
      gameplay_approval: "not_approved",
    }));
  const original = structuredClone(questions);

  assert.deepEqual(selectPreviewQuestions(questions, "atlas-7", 3), selectPreviewQuestions(questions, "atlas-7", 3));
  assert.notDeepEqual(selectPreviewQuestions(questions, "atlas-7", 3), selectPreviewQuestions(questions, "atlas-8", 3));
  assert.deepEqual(questions, original);
});

test("preview results explicitly exclude XP, progression, daily, and cloud effects", async () => {
  const { createPreviewResult } = await import("../pilot/external-content-preview-core.mjs");
  assert.deepEqual(createPreviewResult(3, 4), {
    correct: 3,
    total: 4,
    accuracy: 75,
    xp_awarded: 0,
    progression_eligible: false,
    daily_eligible: false,
    cloud_sync_eligible: false,
  });
});
