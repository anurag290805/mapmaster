#!/usr/bin/env python3
"""Inventory current SVG path labels; this is not a geographic accuracy audit."""
import json
import subprocess
import xml.etree.ElementTree as ET
from collections import Counter

JS = r'''
const fs = require('node:fs');
const vm = require('node:vm');
const c = vm.createContext({});
vm.runInContext(fs.readFileSync('js/data.js', 'utf8') + ';this.maps=MAPS', c);
const ui = fs.readFileSync('js/ui.js', 'utf8');
vm.runInContext(ui.slice(ui.indexOf('const SVG_ALIASES ='), ui.indexOf('// Reverse map:')) + ';this.aliases=SVG_ALIASES', c);
console.log(JSON.stringify({maps:c.maps, aliases:c.aliases}));
'''
data = json.loads(subprocess.check_output(['node', '-e', JS], text=True))
for key, config in data['maps'].items():
    root = ET.parse(config['svg']).getroot()
    names = Counter()
    ids = Counter(node.get('id') for node in root.iter() if node.get('id'))
    duplicate_ids = [identifier for identifier, count in ids.items() if count > 1]
    for path in root.iter('{http://www.w3.org/2000/svg}path'):
        raw = next((path.get(attr) for attr in ('aria-label', 'name', 'data-name', 'title', 'id') if path.get(attr)), None)
        if not raw:
            title = path.find('{http://www.w3.org/2000/svg}title')
            raw = title.text.strip() if title is not None and title.text else None
        if raw:
            names[data['aliases'].get(raw.strip(), raw)] += 1
    missing = [name for name in config['regions'] if name not in names]
    multi = [name for name in config['regions'] if names[name] > 1]
    print(f'{key}: {len(config["regions"])-len(missing)}/{len(config["regions"])} label matches; missing: {", ".join(missing) or "none"}; multiple paths: {len(multi)}; duplicate IDs: {", ".join(duplicate_ids) or "none"}')
print('Multiple paths may be legitimate fragments. Label matches do not prove correct geometry, hit testing, or licensing.')
