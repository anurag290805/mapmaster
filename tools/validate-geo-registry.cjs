const fs = require('node:fs');
function validateRegistry(registry) {
  const errors = [], ids = new Set(), seen = new Set(), features = new Map();
  for (const e of registry.entities || []) {
    if (ids.has(e.entity_id)) errors.push(`duplicate entity ${e.entity_id}`);
    ids.add(e.entity_id);
    for (const occurrence of e.occurrences || []) {
      if (seen.has(occurrence.question_key)) errors.push(`duplicate occurrence ${occurrence.question_key}`);
      seen.add(occurrence.question_key);
    }
    if (!['verified','reconciled'].includes(e.status)) continue;
    if (!e.source || !e.source.geometry_present || !e.source.geometry_valid || !e.source.feature_id) errors.push(`invalid geometry ${e.entity_id}`);
    const expectedLevel = e.entity_type === 'country' || e.entity_type === 'territory' ? 'admin0' : 'admin1';
    if (e.source?.source_level !== expectedLevel) errors.push(`incorrect administrative level ${e.entity_id}`);
    if (!e.evidence?.independent_game_iso || e.evidence.independent_game_iso !== e.source?.source_iso || ((e.entity_type === 'country' || e.entity_type === 'territory') && e.entity_id !== `iso3166-1:${e.source?.source_iso}`)) errors.push(`conflicting identifier ${e.entity_id}`);
    const feature = `${e.source?.dataset || ''}:${e.source?.feature_id}`;
    if (features.has(feature) && features.get(feature) !== e.entity_id) errors.push(`ambiguous source association ${feature}`);
    features.set(feature,e.entity_id);
  }
  const expected = registry.expected_occurrences || [];
  if (new Set(expected).size !== expected.length) errors.push('duplicate expected occurrence');
  for (const key of expected) if (!seen.has(key)) errors.push(`missing occurrence ${key}`);
  for (const key of seen) if (!expected.includes(key)) errors.push(`unexpected occurrence ${key}`);
  return errors;
}
if (require.main === module) {
  const registry = JSON.parse(fs.readFileSync(process.argv[2] || 'docs/engineering/CP05_GEO_REGISTRY.json','utf8'));
  const errors=validateRegistry(registry); console.log(errors.length ? errors.join('\n') : `Registry structure valid: ${registry.entities.length} records, ${registry.expected_occurrences.length} occurrences`); process.exitCode=errors.length ? 1 : 0;
}
module.exports = {validateRegistry};
