const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const candidateRoot = path.join(root, "candidate", "admin1");
const manifestPath = path.join(candidateRoot, "manifest.json");

const expected = {
  australia: 8,
  brazil: 27,
  canada: 13,
  germany: 16,
  japan: 47,
  usa: 50,
};
const expectedSourceFeatures = { ...expected, australia: 10 };

test("CP05 Admin-1 candidates are source-pinned, complete, and isolated from production", () => {
  assert.ok(
    fs.existsSync(manifestPath),
    "missing source-pinned Admin-1 candidate manifest",
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert.equal(manifest.schema_version, 1);
  assert.equal(manifest.status, "candidate_not_live");
  assert.equal(
    manifest.source.dataset,
    "Natural Earth Admin 1 – States, Provinces",
  );
  assert.equal(manifest.source.version, "5.1.1");
  assert.equal(
    manifest.source.url,
    "https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_1_states_provinces.zip",
  );
  assert.equal(
    manifest.source.sha256,
    "efc59726337323058f9446210adc96673179cd344e053666ee3d28cb58ba2b05",
  );
  assert.equal(manifest.source.license, "Public domain");
  assert.equal(manifest.source.attribution_required, false);

  assert.deepEqual(
    Object.keys(manifest.scopes).sort(),
    Object.keys(expected).sort(),
  );
  for (const [scope, expectedCount] of Object.entries(expected)) {
    const entry = manifest.scopes[scope];
    assert.equal(entry.question_count, expectedCount, `${scope} coverage`);
    assert.equal(
      entry.selected_source_feature_count,
      expectedSourceFeatures[scope],
      `${scope} complete selected source components`,
    );
    assert.equal(
      entry.live_approved,
      false,
      `${scope} must remain out of production`,
    );
    assert.equal(
      new Set(entry.mappings.map((mapping) => mapping.question_key)).size,
      expectedCount,
    );
    assert.equal(
      new Set(entry.mappings.map((mapping) => mapping.source_id)).size,
      expectedCount,
    );

    if (
      entry.status ===
      "candidate_ready_for_manual_geometry_and_interaction_review"
    ) {
      assert.ok(
        entry.mappings.every((mapping) => mapping.rendered_geometry_valid),
        `${scope} valid rendered topology`,
      );
      if (scope !== "brazil")
        assert.ok(
          entry.mappings.every((mapping) => mapping.source_geometry_valid),
          `${scope} valid source topology`,
        );
      assert.ok(
        entry.mappings.every(
          (mapping) => mapping.source_components.length >= 1,
        ),
        `${scope} source component declarations`,
      );
      const asset = path.join(root, entry.asset);
      assert.ok(fs.existsSync(asset), `${scope} candidate SVG exists`);
      assert.equal(
        crypto
          .createHash("sha256")
          .update(fs.readFileSync(asset))
          .digest("hex"),
        entry.asset_sha256,
        `${scope} SVG checksum`,
      );
      const svg = fs.readFileSync(asset, "utf8");
      assert.match(svg, /<svg\b[^>]*viewBox="0 0 1000 700"/);
      assert.equal(
        (svg.match(/data-question-key=/g) || []).length,
        expectedCount,
        `${scope} interactive targets`,
      );
      assert.equal(
        (svg.match(/<path\b/g) || []).length,
        entry.rendered_polygon_count,
        `${scope} polygon count`,
      );
    } else assert.fail(`${scope} should have a source-pinned candidate`);
  }

  const australia = manifest.scopes.australia;
  assert.deepEqual(
    australia.mappings
      .flatMap((mapping) => mapping.source_components)
      .map((component) => component.source_name)
      .filter((name) => ["Lord Howe Island", "Macquarie Island"].includes(name))
      .sort(),
    ["Lord Howe Island", "Macquarie Island"],
    "Australian state targets retain their separately-recorded island components",
  );

  const brazil = manifest.scopes.brazil;
  const goias = brazil.mappings.find(
    (mapping) => mapping.source_id === "BRA-1294",
  );
  assert.equal(goias.source_geometry_valid, false);
  assert.equal(goias.rendered_geometry_valid, true);
  assert.deepEqual(brazil.repair, {
    source_id: "BRA-1294",
    algorithm: "GEOS MakeValid 3.14.1, exact-source attested",
    source_wkb_sha256:
      "443c7a659614b2527a55f1fc8d255c61951a895eff31727690f95612b82782eb",
    repaired_wkb_sha256:
      "b446c1231187a5c4bc944df91aafa02b447e0b74db151476fbe7b9b83050a7c6",
    removed_source_ring_coordinate_indices_0_based: [264, 348],
    added_coordinates: 0,
    area_delta_square_degrees: 7.105427357601002e-15,
    independent_validation: {
      dataset: "IBGE GO_UF_2024",
      sha256:
        "32556057bbbbe00fbe8555a9241544de7e776239ef2c3a4caa47bb6f5286bca6",
      geometry_valid: true,
      intersection_over_union: 0.9740752215706935,
    },
  });
});

test("Japan's attested Natural Earth Amami components are assigned to the MLIT Kagoshima owner", () => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const japan = manifest.scopes.japan;
  const kagoshima = japan.mappings.find(
    (mapping) => mapping.display_name === "Kagoshima",
  );
  const okinawa = japan.mappings.find(
    (mapping) => mapping.display_name === "Okinawa",
  );

  assert.deepEqual(japan.component_reallocation, {
    algorithm:
      "exact Natural Earth polygon WKB SHA-256 reassignment; no authority geometry is copied",
    authority: {
      dataset: "MLIT National Land Numerical Information N03 administrative areas",
      version: "2024",
      sha256:
        "a03111be0fe726ff270cbc1dd16f38bc926cf814e67c8cd2e52157629d138b98",
      owner_n03_001: "鹿児島県",
      owner_n03_007: "46000",
      excluded_n03_001: "沖縄県",
      excluded_n03_007: "47000",
    },
    from: { question_key: "japan:032", source_id: "JPN-3502" },
    to: { question_key: "japan:018", source_id: "JPN-3501" },
    components: [
      "77cef780b3b31304a939f7b3e935d6600a6580569d767e5c3b0b59f009b40f7d",
      "d1db188558eaf25c419ee93f6a797cb5724fc3c37861dd9f0a07cbee0ef9b58e",
      "d1da7a5f8b1cbe6e450b84a7d1a23abe9344523fb50ccdf7ce269b4655d880a1",
      "c98e1cc1e25991b9b2bdd73e447847a5cadf87045c34368bd08d7dc69f75a853",
      "d1fa40e7eb9183a72062370055837cbd599c5a405c519261e751eb0289f7e811",
      "57f756470b7b5a060bf80a7791062deae3fc87564ec479d25a8b3f2fb0260460",
    ],
  });
  assert.equal(kagoshima.source_polygon_count, 19);
  assert.equal(okinawa.source_polygon_count, 23);
  assert.deepEqual(
    kagoshima.source_components.find(
      (component) => component.component_reallocation_from_question_key,
    ),
    {
      source_name: "Okinawa",
      source_id: "JPN-3502",
      source_iso_3166_2: "JP-47",
      source_geometry_valid: true,
      component_reallocation_from_question_key: "japan:032",
      component_wkb_sha256:
        japan.component_reallocation.components,
    },
  );
  assert.deepEqual(okinawa.removed_source_components, [
    {
      reallocated_to_question_key: "japan:018",
      reallocated_to_source_id: "JPN-3501",
      component_wkb_sha256: japan.component_reallocation.components,
    },
  ]);
});
