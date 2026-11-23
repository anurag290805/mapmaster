const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

test('diagnostic candidate preserves every configured identity without granting live approval', () => {
  const report = JSON.parse(fs.readFileSync('docs/engineering/CP05_WORLD_COVERAGE.json'));
  const manifest = JSON.parse(fs.readFileSync('candidate/world-manifest.json'));
  const svg = fs.readFileSync('candidate/world.svg', 'utf8');
  assert.equal(manifest.live_approved, false);
  assert.equal(manifest.entities.length, 194);
  assert.deepEqual(manifest.entities.map(e => e.canonical_id), report.questions.map(q => q.canonical_id));
  assert.deepEqual(manifest.entities.map(e => e.source_feature_id), report.questions.map(q => q.source_feature_id));
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const e of manifest.entities) {
    assert.ok(ids.includes(e.dom_id));
    const group = svg.match(new RegExp(`<g id="${e.dom_id}"[^>]*>(.*?)</g>`));
    assert.ok(group, `Missing country group ${e.dom_id}`);
    assert.equal((group[1].match(/<path /g) || []).length, e.polygon_parts);
    assert.ok(group[0].includes(`data-canonical-id="${e.canonical_id}"`));
  }
  assert.equal(crypto.createHash('sha256').update(svg).digest('hex'), manifest.svg_sha256);
});
