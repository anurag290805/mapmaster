const test = require('node:test');
const assert = require('node:assert/strict');

const { buildReadiness } = require('../tools/build-cp05-readiness.cjs');

test('readiness report preserves conservative world and regional gates', () => {
  const report = buildReadiness();

  assert.equal(report.schema_version, '1.0.0');
  assert.deepEqual(report.world.categories, {
    VERIFIED: 0,
    AUTOMATED_ONLY: 165,
    AMBIGUOUS: 7,
    POLICY_DEPENDENT: 22,
    BLOCKED: 0,
  });
  assert.equal(report.world.total, 194);
  assert.equal(report.world.live_eligible, 0);
  assert.equal(report.world.canonical_ids_unique, true);
  assert.equal(report.world.candidate_geometry_ids_unique, true);
  assert.deepEqual(report.world.noninteractive_context_features, {
    total: 64,
    source_feature_ids_unique: true,
    distinct_from_country_targets: true,
  });
  assert.equal(report.world.source_invalid, 0);
  assert.equal(report.world.source_invalid_before_repair, 1);
  assert.equal(report.world.source_repaired, 1);
  assert.equal(report.world.multipart, 116);

  assert.deepEqual(report.regional.india.categories, {
    VERIFIED: 0,
    AUTOMATED_ONLY: 0,
    AMBIGUOUS: 0,
    POLICY_DEPENDENT: 36,
    BLOCKED: 0,
  });
  assert.equal(report.regional.india.locate_questions, 28);
  assert.equal(report.regional.india.typing_bonus_questions, 8);
  assert.deepEqual(
    report.regional.india.policy_decisions_required.map(decision => decision.id),
    [
      'india-effective-boundary-date',
      'india-jammu-kashmir-ladakh-boundary-policy',
      'india-source-license-and-attribution',
      'india-locate-versus-typing-scope',
    ],
  );
  assert.deepEqual(report.regional.india.source_evidence, {
    pinned_geoboundaries_feature_count: 36,
    pinned_geoboundaries_boundary_id: 'IND-ADM1-1811400',
    pinned_geoboundaries_reported_year: '2011',
    configured_states: 28,
    configured_union_territory_typing_bonuses: 8,
    source_pairs: 36,
  });
  assert.equal(report.regional.subnational.no_candidate_discovery, 54);
  assert.equal(report.regional.subnational.multiple_candidate_discovery, 3);
  assert.equal(report.release.ready, false);
});
