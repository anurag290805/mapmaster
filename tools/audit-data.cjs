// Read-only CP01 inventory. Run from the repository root: node tools/audit-data.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('js/data.js', 'utf8') + '\nthis.data = { MAPS, FLAGS, CAPITALS, MAP_SUPPORT };', context);
const { MAPS, FLAGS, CAPITALS, MAP_SUPPORT } = context.data;
let missing = 0;
for (const [key, map] of Object.entries(MAPS)) {
  const duplicate = map.regions.filter((x, i, a) => a.indexOf(x) !== i);
  const absent = !fs.existsSync(map.svg);
  if (absent) missing++;
  const capitalData = CAPITALS[key] || {};
  const flagCount = map.regions.filter(r => FLAGS[r]).length;
  const capitalCount = map.regions.filter(r => capitalData[r]).length;
  console.log(`${key}: ${map.regions.length} entries, ${new Set(map.regions).size} unique; flags ${flagCount}, capitals ${capitalCount}; ${absent ? 'MISSING ' + map.svg : 'map present'}${duplicate.length ? '; DUPLICATES ' + duplicate.join(', ') : ''}`);
  if (!MAP_SUPPORT[key]) console.log(`  missing support declaration: ${key}`);
}
console.log(`World: ${new Set(MAPS.world.regions).size} distinct names; flag records ${Object.keys(FLAGS).length}; world capital records ${Object.keys(CAPITALS.world).length}`);
console.log(`Missing configured map files: ${missing}. Counts are key matches, not correctness or playable coverage.`);
process.exitCode = missing ? 1 : 0;
