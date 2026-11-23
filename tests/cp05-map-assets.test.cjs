const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('configured American maps exist and contain representative regional geometry', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync('js/data.js', 'utf8') + '\nthis.maps = MAPS;', context);
  for (const [key, ids] of [['northAmerica', ['CA', 'US', 'MX']], ['southAmerica', ['BR', 'AR', 'CL']]]) {
    const file = context.maps[key].svg;
    assert.ok(fs.existsSync(file), `${key}: ${file} is missing`);
    const svg = fs.readFileSync(file, 'utf8');
    for (const id of ids) assert.match(svg, new RegExp(`<path\\s+id="${id}"`), `${key}: ${id}`);
  }
});
