const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = vm.createContext({});
vm.runInContext(fs.readFileSync('js/data.js','utf8')+';this.world=MAPS.world.regions',source);
const report = () => JSON.parse(fs.readFileSync('docs/engineering/CP05_WORLD_COVERAGE.json','utf8'));

test('world coverage retains every configured question exactly once', () => {
  const r=report();
  assert.equal(r.questions.length,194);
  assert.deepEqual(r.questions.map(q=>q.display_name),Array.from(source.world));
  assert.equal(new Set(r.questions.map(q=>q.question_key)).size,194);
  assert.equal(new Set(r.questions.map(q=>q.canonical_id)).size,194);
});

test('candidate and live gates cannot promote unresolved identity, geometry, or policy', () => {
  const r=report();
  for (const q of r.questions) {
    assert.ok(q.source_feature_id);
    assert.ok(q.geometry && q.identity && q.policy);
    if (q.gates.live_eligible) {
      assert.equal(q.identity.status,'verified');
      assert.equal(q.geometry.status,'verified');
      assert.equal(q.policy.status,'approved');
    }
  }
  assert.equal(r.live_integration_allowed,false);
  assert.equal(r.questions.filter(q=>q.gates.live_eligible).length,0);
});

test('Egypt repair preserves the pinned source and proves topology, containment, and non-overlap', () => {
  const egypt = report().questions.find(q => q.canonical_id === 'iso3166-1:EG');
  assert.equal(egypt.geometry.status, 'repaired_source_geometry_not_reviewed');
  assert.equal(egypt.geometry.source_valid, false);
  assert.match(egypt.geometry.source_validity_reason, /Ring Self-intersection/);
  assert.equal(egypt.geometry.valid, true);
  assert.equal(egypt.geometry.repair.method, 'GEOS make_valid');
  assert.equal(egypt.geometry.repair.representative_point_covered, true);
  assert.equal(egypt.geometry.repair.bounds_unchanged, true);
  assert.ok(egypt.geometry.repair.relative_area_delta < 1e-12);
  assert.deepEqual(egypt.geometry.repair.neighbor_checks, [
    { canonical_id: 'iso3166-1:IL', positive_area_overlap: 0, touches: true },
    { canonical_id: 'iso3166-1:LY', positive_area_overlap: 0, touches: true },
    { canonical_id: 'iso3166-1:SD', positive_area_overlap: 0, touches: true },
  ]);
  assert.deepEqual(egypt.geometry.overlaps, []);
});

test('the seven cross-scale cases remain explicit ambiguities rather than inferred corrections', () => {
  const r = report();
  assert.deepEqual(
    r.questions.filter(q => q.blockers.includes('cross-resolution discrepancy requires geometry review'))
      .map(q => q.display_name).sort(),
    ['Kiribati', 'Maldives', 'Marshall Islands', 'Monaco', 'Seychelles', 'Tuvalu', 'Vatican City'],
  );
});
