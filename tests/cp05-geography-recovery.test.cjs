const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = vm.createContext({});
vm.runInContext(fs.readFileSync('js/data.js', 'utf8') + '\nthis.data={MAPS, INDIA_UTS};', context);
const requirements = JSON.parse(fs.readFileSync('docs/engineering/CP05_GEO_REQUIREMENTS.json', 'utf8'));
const feasibility = JSON.parse(fs.readFileSync('docs/engineering/CP05_GEO_FEASIBILITY.json', 'utf8'));

test('geographic inventory covers current questions and India bonus without claiming canonical identities', () => {
  assert.deepEqual(requirements.scopes.map(s => s.scope), Object.keys(context.data.MAPS));
  const keys = new Set();
  for (const scope of requirements.scopes) {
    assert.deepEqual(scope.questions.map(q => q.display_name), Array.from(context.data.MAPS[scope.scope].regions));
    for (const question of scope.questions) {
      assert.equal(question.canonical_entity_id, null);
      assert.equal(keys.has(question.question_key), false);
      keys.add(question.question_key);
    }
  }
  assert.deepEqual(requirements.india_bonus_union_territories.map(q => q.display_name), Array.from(context.data.INDIA_UTS));
});

test('compatibility evidence never promotes a candidate label match into a verified target', () => {
  for (const scope of feasibility.scope_feasibility) {
    const required = requirements.scopes.find(s => s.scope === scope.scope);
    assert.ok(required);
    assert.deepEqual(scope.questions.map(q => q.question_key), required.questions.map(q => q.question_key));
    for (const question of scope.questions) {
      assert.equal(question.canonical_entity_id, null);
      assert.match(question.classification, /requires_separately_verified|unsupported_pending/);
    }
  }
});

test('known source ambiguities and missing low-resolution candidates stay visible', () => {
  const usa = feasibility.scope_feasibility.find(scope => scope.scope === 'usa');
  const washington = usa.questions.find(question => question.name === 'Washington');
  const matches = washington.candidate_features_by_layer['ne_10m_admin_1_states_provinces.zip'];
  assert.deepEqual(new Set(matches.map(match => match.iso)), new Set(['US-WA', 'US-DC']));
  const world = feasibility.scope_feasibility.find(scope => scope.scope === 'world');
  assert.equal(world.questions.find(question => question.name === 'Nauru').candidate_features_by_layer['ne_110m_admin_0_countries.zip'].length, 0);
  assert.equal(feasibility.layers['ne_10m_admin_0_countries.zip'].invalid_geometries.some(item => item.id === '1159320575'), true);
});
