const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "candidate", "amcharts", "manifest.json");

const expected = {
  china: { questions: 33, sourcePaths: 34, context: ["CN-TW"] },
  spain: { questions: 17, sourcePaths: 17, context: [] },
  uae: {
    questions: 7,
    sourcePaths: 10,
    context: ["AE-NZ1", "AE-NZ2", "OM-MU"],
  },
};

test("CP05 amCharts candidates retain exact source files, attribution, mappings, and isolation", () => {
  assert.ok(fs.existsSync(manifestPath), "missing amCharts candidate manifest");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert.equal(manifest.schema_version, 1);
  assert.equal(manifest.status, "candidate_not_live");
  assert.deepEqual(Object.keys(manifest.scopes).sort(), Object.keys(expected).sort());

  for (const [scope, expectation] of Object.entries(expected)) {
    const entry = manifest.scopes[scope];
    assert.equal(entry.live_approved, false, `${scope} must remain candidate-only`);
    assert.equal(entry.license.spdx, "CC-BY-4.0");
    assert.equal(entry.license.attribution_required, true);
    assert.equal(entry.question_count, expectation.questions);
    assert.equal(entry.source_path_count, expectation.sourcePaths);
    assert.equal(entry.mappings.length, expectation.questions);
    assert.equal(new Set(entry.mappings.map((item) => item.question_key)).size, expectation.questions);
    assert.equal(new Set(entry.mappings.map((item) => item.source_id)).size, expectation.questions);
    assert.deepEqual(
      entry.noninteractive_context.map((item) => item.source_id).sort(),
      expectation.context,
      `${scope} context paths must be explicit`,
    );

    const sourcePath = path.join(root, entry.source_file);
    assert.ok(fs.existsSync(sourcePath), `${scope} source SVG is missing`);
    assert.equal(
      crypto.createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex"),
      entry.source_sha256,
      `${scope} source SVG checksum`,
    );
    const svg = fs.readFileSync(sourcePath, "utf8");
    assert.equal((svg.match(/<path\b/g) || []).length, expectation.sourcePaths);
    assert.match(
      svg,
      /<a id="amcharts-credit" href="https:\/\/www\.amcharts\.com\/svg-maps\/"/,
      `${scope} must retain the source credit required by amCharts`,
    );
    assert.match(svg, /Map by amcharts\.com/);
    for (const mapping of entry.mappings) {
      assert.match(svg, new RegExp(`<path\\s+id="${mapping.source_id}"(?=\\s)`));
      assert.equal(mapping.mapping_status, "source-id-and-name-attested");
    }
    for (const context of entry.noninteractive_context) {
      assert.match(svg, new RegExp(`<path\\s+id="${context.source_id}"(?=\\s)`));
      assert.equal(context.selection, "noninteractive");
    }
  }

  const shippedFiles = fs.readdirSync(path.join(root, "svg"));
  for (const scope of Object.keys(expected))
    assert.ok(!shippedFiles.includes(`${scope}.amcharts.svg`));
  const viteConfig = fs.readFileSync(path.join(root, "vite.config.mts"), "utf8");
  assert.match(viteConfig, /for \(const dir of \["svg", "assets"\]\)/);
  assert.doesNotMatch(viteConfig, /cpSync\(resolve\("candidate"\)/);
});
