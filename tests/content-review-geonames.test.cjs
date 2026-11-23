const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const detail = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/content-review/geonames-detail.json"), "utf8"),
);

test("GeoNames adapter constructs exact ID requests without exposing credentials in records", async () => {
  const { buildGeoNamesUrl } = await import("../tools/content-review/geonames.mjs");
  const url = buildGeoNamesUrl(1261481, "review-user");
  assert.equal(url, "https://secure.geonames.org/getJSON?geonameId=1261481&username=review-user");
});

test("GeoNames normalization preserves IDs and flags a non-blocking country/name mismatch", async () => {
  const { normalizeGeoNamesResponses } = await import("../tools/content-review/geonames.mjs");
  const normalized = normalizeGeoNamesResponses({
    selection: { records: [{
      geoname_id: 1261481,
      name: "Delhi",
      kind: "city",
      expected_fcl: "P",
      expected_fcode: "PPLC",
      expected_country_code: "IN",
    }] },
    responses: [{ selection_id: 1261481, response: detail }],
    retrieved_at: "2026-11-09T00:00:00.000Z",
  });
  const record = normalized.records[0];
  assert.equal(record.source_id, 1261481);
  assert.equal(record.coordinates.latitude, 28.6139);
  assert.equal(record.coordinates.longitude, 77.209);
  assert.equal(record.technical_validation, "accepted");
  assert.equal(record.human_content_approval, "pending_review");
  assert.equal(record.gameplay_approval, "not_approved");
  assert.deepEqual(record.review_flags, ["source_name_mismatch"]);
  assert.equal(record.source.alternate_names[0].name, "NCT of Delhi");
});

test("GeoNames normalization rejects unsafe coordinates and duplicate selection IDs", async () => {
  const { normalizeGeoNamesResponses } = await import("../tools/content-review/geonames.mjs");
  assert.throws(
    () => normalizeGeoNamesResponses({ selection: { records: [{ geoname_id: 1 }, { geoname_id: 1 }] }, responses: [], retrieved_at: "2026-11-09T00:00:00.000Z" }),
    /duplicate/i,
  );
  const normalized = normalizeGeoNamesResponses({
    selection: { records: [{ geoname_id: 1261481, name: "New Delhi", kind: "city", expected_fcl: "P", expected_fcode: "PPLC" }] },
    responses: [{ selection_id: 1261481, response: { ...detail, lat: "95" } }],
    retrieved_at: "2026-11-09T00:00:00.000Z",
  });
  assert.equal(normalized.records[0].technical_validation, "rejected");
  assert.deepEqual(normalized.records[0].validation_errors, ["coordinate_out_of_bounds"]);
});

test("GeoNames snapshot retries a transient transport close without changing the selected ID", async () => {
  const { fetchGeoNamesSnapshot } = await import("../tools/content-review/geonames.mjs");
  let attempts = 0;
  const snapshot = await fetchGeoNamesSnapshot({
    selection: { records: [{ geoname_id: 1261481, name: "New Delhi", kind: "city", expected_fcl: "P", expected_fcode: "PPLC" }] },
    username: "review-user",
    retrievedAt: "2026-11-09T00:00:00.000Z",
    retryDelay: async () => {},
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) throw new TypeError("fetch failed");
      return { ok: true, json: async () => detail };
    },
  });
  assert.equal(attempts, 2);
  assert.equal(snapshot.normalized.records[0].source_id, 1261481);
});
