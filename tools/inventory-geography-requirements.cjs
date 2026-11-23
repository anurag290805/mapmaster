// Snapshot configured questions; question keys are not canonical geographic IDs.
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const data = vm.createContext({});
vm.runInContext(fs.readFileSync('js/data.js', 'utf8') + '\nthis.result={MAPS,FLAGS,CAPITALS,MAP_SUPPORT,INDIA_UTS}', data);
const rules = {exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/shared/gameplay.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, rules);
const { MAPS, FLAGS, CAPITALS, MAP_SUPPORT, INDIA_UTS } = data.result;
const regional = new Set(['world','europe','northAmerica','southAmerica','africa','asia','oceania']);
const scopes = Object.entries(MAPS).map(([key, map]) => ({
  scope: key, title: map.name, asset: map.svg,
  declared_scope: key === 'world' ? 'world' : regional.has(key) ? 'regional' : 'country_subdivisions',
  declared_modes: MAP_SUPPORT[key],
  questions: map.regions.map((name, i) => ({
    question_key: `${key}:${String(i + 1).padStart(3, '0')}`, display_name: name,
    canonical_entity_id: null,
    classification: key === 'india' ? 'state_as_configured_unverified' : regional.has(key) ? 'country_or_territory_unverified' : 'subdivision_or_special_region_unverified',
    configured_membership: key,
    gameplay_answer_aliases: rules.exports.ANSWER_ALIASES[name] || [],
    target_geography_aliases: [],
    expected_locate: !!MAP_SUPPORT[key]?.locate,
    runtime_name_mode: !!MAP_SUPPORT[key]?.name,
    runtime_flag_data_available: !!FLAGS[name],
    runtime_capital_data_available: !!CAPITALS[key]?.[name],
    identity_status: 'unreviewed', geometry_status: 'unverified',
  })),
}));
const out = { schema_version: 1, baseline: 'js/data.js and src/shared/gameplay.ts in current working tree',
  disclaimer: 'Question keys are scope/order identifiers, not canonical geographic identities. Classifications and configured memberships reflect the game, not verified political geography. Gameplay aliases are input aliases, not approved geometry mappings.',
  policy: { boundary: 'unresolved', territories: 'unresolved', multipart: 'all verified pieces must resolve to one identity', small_targets: 'must remain accurately selectable without fabricated polygons', region_membership: 'configured question pools only; geographic membership requires review' },
  scopes,
  india_bonus_union_territories: INDIA_UTS.map((name, i) => ({question_key:`india-bonus:${String(i+1).padStart(3,'0')}`,display_name:name,canonical_entity_id:null,classification:'union_territory_as_configured_unverified',mode:'typing_bonus',expected_locate:false,identity_status:'unreviewed'})),
};
fs.writeFileSync('docs/engineering/CP05_GEO_REQUIREMENTS.json', JSON.stringify(out,null,2)+'\n');
console.log(`${scopes.length} scopes, ${scopes.reduce((n,s)=>n+s.questions.length,0)} questions, ${INDIA_UTS.length} India bonus entries`);
