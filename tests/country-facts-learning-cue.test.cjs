const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("pending country facts cannot reveal country or fact before a correct resolution", async () => {
  const catalog = await import(path.join(root, "candidate/country-facts/catalog.v1.mjs"));
  const cue = await import(path.join(root, "candidate/country-facts/learning-cue-preview-core.mjs"));
  const record = catalog.COUNTRY_FACT_CATALOG.find((item) => item.display_name === "India");
  const model = cue.learningCuePreviewModel({ record, resolution: "retry" });
  assert.equal(model.prompt, "Identify the current prompt to unlock a country fact.");
  assert.equal(model.country, "");
  assert.equal(model.fact, "");
  assert.equal(model.reveal_allowed, false);
});

test("pending facts render only in the development editorial preview after resolution", async () => {
  const catalog = await import(path.join(root, "candidate/country-facts/catalog.v1.mjs"));
  const cue = await import(path.join(root, "candidate/country-facts/learning-cue-preview-core.mjs"));
  const record = catalog.COUNTRY_FACT_CATALOG.find((item) => item.display_name === "India");
  const publicModel = cue.learningCuePreviewModel({ record, resolution: "correct" });
  const previewModel = cue.learningCuePreviewModel({ record, resolution: "correct", developmentPreview: true });
  assert.equal(publicModel.country, "India");
  assert.equal(publicModel.fact, "");
  assert.equal(previewModel.fact, record.proposed_fact);
  assert.equal(previewModel.development_preview, true);
  assert.equal(previewModel.production_eligible, false);
});
