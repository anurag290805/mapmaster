#!/usr/bin/env python3
"""Generate a conservative SVG inventory, not a geographic validation."""
import collections
import hashlib
import json
import pathlib
import subprocess
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
script = """const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('js/data.js','utf8')+';this.maps=MAPS',c);console.log(JSON.stringify(c.maps));"""
maps = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True))
ns = '{http://www.w3.org/2000/svg}'
report = {'schema_version': 1, 'scope': 'Mechanical inventory only; no geometry, identity, membership, or license is validated.', 'maps': {}}
for key, config in maps.items():
    file = ROOT / config['svg']
    raw = file.read_bytes()
    root = ET.fromstring(raw)
    elements = list(root.iter())
    ids = collections.defaultdict(list)
    for index, el in enumerate(elements):
        if el.get('id'):
            ids[el.get('id')].append({'element_index': index, 'tag': el.tag.split('}')[-1]})
    paths = []
    for index, el in enumerate(elements):
        if el.tag != ns + 'path':
            continue
        title = el.find(ns + 'title')
        labels = {k: el.get(k) for k in ('id', 'name', 'data-name', 'aria-label', 'title', 'class') if el.get(k)}
        if title is not None and title.text and title.text.strip():
            labels['child_title'] = title.text.strip()
        paths.append({'element_index': index, 'path_index': len(paths), 'id': el.get('id'), 'labels': labels, 'geometry_sha256': hashlib.sha256((el.get('d') or '').encode()).hexdigest(), 'identity_status': 'unverified'})
    report['maps'][key] = {'asset': config['svg'], 'asset_sha256': hashlib.sha256(raw).hexdigest(), 'configured_regions': config['regions'], 'paths': paths, 'missing_path_id_indices': [p['path_index'] for p in paths if not p['id']], 'duplicate_ids': {k: v for k, v in ids.items() if len(v) > 1}, 'membership_status': 'unverified', 'absent_entities_status': 'unverified', 'non_geographic_elements_status': 'unverified'}
output = ROOT / 'docs/engineering/CP05_MAP_INVENTORY.json'
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(f"{len(maps)} maps, {sum(len(m['paths']) for m in report['maps'].values())} paths; wrote {output.relative_to(ROOT)}")
for key, m in report['maps'].items():
    print(f"{key}: {len(m['paths'])} paths, {len(m['missing_path_id_indices'])} without id, {len(m['duplicate_ids'])} duplicate ids")
