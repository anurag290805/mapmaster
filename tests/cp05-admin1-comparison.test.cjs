const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function resolveCp05Python() {
  const candidates = [
    process.env.CP05_PYTHON,
    path.join(root, ".cp05-python", "bin", "python"),
    "python3.13",
    "python3",
  ].filter(Boolean);
  const failures = [];

  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ["-c", "import shapefile; import shapely"], {
        stdio: "pipe",
      });
      return candidate;
    } catch (error) {
      failures.push(`${candidate}: ${error.code || "missing CP05 modules"}`);
    }
  }

  throw new Error(
    `CP05 Admin-1 tests require pyshp and shapely. Run npm run setup:cp05-python or set CP05_PYTHON. Tried ${failures.join(", ")}`,
  );
}

const python = resolveCp05Python();

function collection(name, coordinates) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name },
        geometry: { type: "Polygon", coordinates: [coordinates] },
      },
    ],
  };
}

test("comparison utility reports independently-derived overlap and unmatched names", () => {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), "mapmaster-cp05-comparison-"),
  );
  const candidate = path.join(dir, "candidate.geojson");
  const reference = path.join(dir, "reference.geojson");
  const output = path.join(dir, "output.json");
  const candidateCollection = collection("Alpha", [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
    [0, 0],
  ]);
  const referenceCollection = collection("Alpha", [
    [1, 0],
    [3, 0],
    [3, 2],
    [1, 2],
    [1, 0],
  ]);
  candidateCollection.features[0].properties.question_key = "example:001";
  referenceCollection.features[0].properties.raw_union_valid = true;
  referenceCollection.features[0].properties.post_union_simplification_valid = false;
  referenceCollection.features[0].properties.comparison_geometry_valid = true;
  referenceCollection.features[0].properties.empty_or_invalid_sources_after_simplification = 0;
  referenceCollection.features[0].properties.source_administrative_ids = 1;
  fs.writeFileSync(
    candidate,
    JSON.stringify(candidateCollection),
  );
  fs.writeFileSync(
    reference,
    JSON.stringify(referenceCollection),
  );

  execFileSync(python, [
    path.join(root, "tools", "compare-cp05-admin1-authorities.py"),
    "--candidate",
    candidate,
    "--reference",
    reference,
    "--output",
    output,
  ]);

  const result = JSON.parse(fs.readFileSync(output, "utf8"));
  assert.equal(result.summary.compared, 1);
  assert.equal(result.summary.missing_candidate, 0);
  assert.equal(result.summary.missing_reference, 0);
  assert.equal(result.comparisons[0].name, "Alpha");
  assert.equal(result.comparisons[0].candidate_valid, true);
  assert.equal(result.comparisons[0].reference_valid, true);
  assert.equal(result.comparisons[0].intersection_over_union, 1 / 3);
  assert.equal(result.comparisons[0].candidate_coverage_of_reference, 0.5);
  assert.equal(result.comparisons[0].reference_coverage_of_candidate, 0.5);
  assert.equal(result.comparisons[0].candidate_feature_count, 1);
  assert.equal(result.comparisons[0].reference_feature_count, 1);
  assert.equal(result.comparisons[0].candidate_multipart_parts, 1);
  assert.equal(result.comparisons[0].reference_multipart_parts, 1);
  assert.deepEqual(result.comparisons[0].candidate_identity, {
    name: "Alpha",
    question_key: "example:001",
  });
  assert.deepEqual(result.comparisons[0].reference_identity, { name: "Alpha" });
  assert.deepEqual(result.comparisons[0].reference_validation, {
    raw_union_valid: true,
    post_union_simplification_valid: false,
    comparison_geometry_valid: true,
    empty_or_invalid_sources_after_simplification: 0,
    source_administrative_ids: 1,
  });
});

test("comparison utility keeps distinct non-Latin authority identifiers", () => {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), "mapmaster-cp05-unicode-comparison-"),
  );
  const candidate = path.join(dir, "candidate.geojson");
  const reference = path.join(dir, "reference.geojson");
  const output = path.join(dir, "output.json");
  const left = collection("東京都", [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ]);
  const right = collection("沖縄県", [
    [2, 0],
    [3, 0],
    [3, 1],
    [2, 1],
    [2, 0],
  ]);
  fs.writeFileSync(
    candidate,
    JSON.stringify({
      ...left,
      features: [...left.features, ...right.features],
    }),
  );
  fs.writeFileSync(
    reference,
    JSON.stringify({
      ...left,
      features: [...left.features, ...right.features],
    }),
  );

  execFileSync(python, [
    path.join(root, "tools", "compare-cp05-admin1-authorities.py"),
    "--candidate",
    candidate,
    "--reference",
    reference,
    "--output",
    output,
  ]);

  const result = JSON.parse(fs.readFileSync(output, "utf8"));
  assert.equal(result.summary.compared, 2);
  assert.deepEqual(
    result.comparisons.map((item) => item.name).sort(),
    ["東京都", "沖縄県"].sort(),
  );
});

test("Japan authority derivation preserves the source union while simplifying only municipal inputs", () => {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), "mapmaster-cp05-japan-derivation-"),
  );
  const source = path.join(dir, "municipalities.shp");
  const first = path.join(dir, "first.geojson");
  const second = path.join(dir, "second.geojson");
  const fixture = `
import shapefile
writer = shapefile.Writer(${JSON.stringify(source)})
for field in ("N03_001", "N03_002", "N03_003", "N03_004", "N03_005", "N03_007"):
    writer.field(field, "C")
for coordinates, municipality in (([[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], "001"), ([[1, 0], [1, 1], [2, 1], [2, 0], [1, 0]], "002")):
    writer.poly([coordinates])
    writer.record("Test Prefecture", "", "", "", "", municipality)
writer.close()
`;
  execFileSync(python, ["-c", fixture]);

  for (const output of [first, second]) {
    execFileSync(python, [
      path.join(root, "tools", "derive-cp05-japan-prefectures.py"),
      "--source",
      source,
      "--output",
      output,
      "--tolerance",
      "0.01",
    ]);
  }

  assert.equal(fs.readFileSync(first, "utf8"), fs.readFileSync(second, "utf8"));
  const result = JSON.parse(fs.readFileSync(first, "utf8"));
  assert.equal(
    result.properties.method,
    "simplify each municipal geometry before union by N03_001; retain raw-union and post-union-simplification diagnostics",
  );
  const feature = result.features[0];
  assert.equal(feature.properties.source_parts, 2);
  assert.equal(feature.properties.N03_001, "Test Prefecture");
  assert.deepEqual(feature.properties.N03_007, ["001", "002"]);
  assert.equal(feature.properties.raw_union_valid, true);
  assert.equal(feature.properties.post_union_simplification_valid, true);
  assert.equal(feature.properties.comparison_geometry_valid, true);
  assert.equal(feature.properties.empty_or_invalid_sources_after_simplification, 0);
  assert.equal(feature.properties.source_administrative_ids, 2);
  assert.equal(feature.properties.comparison_area_difference_vs_raw_union, 0);
});
