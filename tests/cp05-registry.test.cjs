const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRegistry } = require('../tools/validate-geo-registry.cjs');
const fs = require('node:fs');

const occurrence = {question_key:'world:001', scope:'world'};
const entity = {entity_id:'iso3166-1:AA', entity_type:'country', status:'reconciled', parent:null,
  occurrences:[occurrence], source:{feature_id:'1', geometry_present:true, geometry_valid:true, source_level:'admin0', source_iso:'AA'},
  evidence:{independent_game_iso:'AA'}, policy_notes:[]};
function registry(entities=[entity]) {return {entities, expected_occurrences:['world:001']};}

test('registry validator accepts only independent identifiers with eligible geometry', () => {
  assert.deepEqual(validateRegistry(registry()), []);
  const e=structuredClone(entity); e.evidence.independent_game_iso='BB';
  assert.ok(validateRegistry(registry([e])).some(x=>x.includes('identifier')));
  e.evidence.independent_game_iso='AA'; e.entity_id='iso3166-1:BB';
  assert.ok(validateRegistry(registry([e])).some(x=>x.includes('identifier')));
  e.entity_id='iso3166-1:AA'; e.source.geometry_valid=false;
  assert.ok(validateRegistry(registry([e])).some(x=>x.includes('geometry')));
});

test('registry validator rejects duplicate entities, occurrences and wrong administrative levels', () => {
  assert.ok(validateRegistry(registry([entity,entity])).some(x=>x.includes('duplicate')));
  const e=structuredClone(entity); e.source.source_level='admin1';
  assert.ok(validateRegistry(registry([e])).some(x=>x.includes('level')));
  const other=structuredClone(entity); other.entity_id='iso3166-1:BB'; other.source.source_iso='BB'; other.evidence.independent_game_iso='BB'; other.occurrences=[{question_key:'world:002',scope:'world'}];
  assert.ok(validateRegistry({entities:[entity,other],expected_occurrences:['world:001','world:002']}).some(x=>x.includes('ambiguous source association')));
  const sub=structuredClone(entity); sub.entity_id='iso3166-2:AA-XY'; sub.entity_type='subdivision'; sub.source.source_level='admin0';
  assert.ok(validateRegistry(registry([sub])).some(x=>x.includes('level')));
});

test('generated registry preserves every original occurrence and has no invalid approvals', () => {
  const data=JSON.parse(fs.readFileSync('docs/engineering/CP05_GEO_REGISTRY.json','utf8'));
  assert.deepEqual(validateRegistry(data), []);
  const req=JSON.parse(fs.readFileSync('docs/engineering/CP05_GEO_REQUIREMENTS.json','utf8'));
  const actual=req.scopes.flatMap(scope=>scope.questions.map(q=>q.question_key)).concat(req.india_bonus_union_territories.map(q=>q.question_key));
  assert.deepEqual(data.expected_occurrences,actual);
  assert.equal(data.gameplay_approval,false);
});
