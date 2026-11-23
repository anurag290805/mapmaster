const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('locate eligibility requires an unambiguous configured name and map label', () => {
  const source = fs.readFileSync('js/modes.js', 'utf8');
  const start = source.indexOf('function mapEligibleTargets(');
  const end = source.indexOf('\nfunction ', start + 1);
  assert.ok(start >= 0 && end > start, 'mapEligibleTargets is available');
  const context = vm.createContext({});
  vm.runInContext(source.slice(start, end) + '\nthis.mapEligibleTargets = mapEligibleTargets;', context);
  const result = context.mapEligibleTargets(['A', 'B', 'C', 'C'], ['A', 'A', 'B', 'Other']);
  assert.deepEqual(Array.from(result.eligible), ['A', 'B']);
  assert.deepEqual(Array.from(result.missing), ['C']);
  assert.deepEqual(Array.from(result.duplicates), ['C']);
});
