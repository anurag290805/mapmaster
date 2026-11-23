#!/usr/bin/env python3
"""Build a non-production diagnostic SVG. Requires pyshp, shapely, numpy and the pinned source."""
import hashlib, html, io, json, pathlib, zipfile
import numpy as np
import shapefile
import shapely
from shapely.geometry import shape
from shapely.strtree import STRtree

root = pathlib.Path(__file__).resolve().parent.parent
report_path = root / 'docs/engineering/CP05_WORLD_COVERAGE.json'
report = json.loads(report_path.read_text())
archive = pathlib.Path('/tmp/mapmaster-geodata/ne_10m_admin_0_countries.zip').read_bytes()
assert hashlib.sha256(archive).hexdigest() == report['source']['archive_sha256']
z = zipfile.ZipFile(io.BytesIO(archive))
parts = {k: io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith('.' + k)))) for k in ('shp', 'shx', 'dbf')}
reader = shapefile.Reader(**parts)
features = {str(sr.record.as_dict()['NE_ID']): sr for sr in reader.iterShapeRecords()}
assert len(features) == reader.numRecords
questions = report['questions']
assert len(questions) == 194 and len({q['source_feature_id'] for q in questions}) == 194

def geometry(sr):
    g = shape(sr.shape.__geo_interface__)
    original_valid = g.is_valid
    if not original_valid:
        g = shapely.make_valid(g)
    g = shapely.transform(g, lambda xy: np.round(xy, 8))
    if not g.is_valid or g.is_empty or g.geom_type not in ('Polygon', 'MultiPolygon'):
        raise ValueError('Invalid candidate geometry: ' + shapely.is_valid_reason(g))
    return g, original_valid

def path(poly):
    def ring(coords):
        return 'M' + 'L'.join(f'{x:.8f},{-y:.8f}' for x, y in coords) + 'Z'
    return ring(poly.exterior.coords) + ''.join(ring(r.coords) for r in poly.interiors)

def paths(g, prefix):
    polygons = list(g.geoms) if g.geom_type == 'MultiPolygon' else [g]
    return ''.join(f'<path id="{prefix}-{i}" d="{path(p)}"/>' for i, p in enumerate(polygons)), len(polygons)

mapped = {q['source_feature_id'] for q in questions}
chunks = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="-180 -90 360 180" fill-rule="evenodd" aria-label="Diagnostic world candidate, not approved for gameplay">', '<g id="context" fill="#cbd5e1" pointer-events="none" aria-hidden="true">']
context = []
for fid in sorted(set(features) - mapped):
    sr = features[fid]
    g, valid = geometry(sr)
    p, count = paths(g, 'context-' + fid)
    chunks.append(p)
    context.append({'source_feature_id': fid, 'source_name': sr.record.as_dict()['NAME'], 'polygon_parts': count, 'source_valid': valid})
chunks.append('</g><g id="countries" fill="#8ab6ab" stroke="#ffffff" stroke-width="0.03">')
entities, geometries = [], []
for q in questions:
    fid = q['source_feature_id']
    g, valid = geometry(features[fid])
    iso = q['canonical_id'].split(':')[1]
    dom = 'country-' + iso
    p, count = paths(g, 'part-' + iso)
    chunks.append(f'<g id="{dom}" data-canonical-id="{html.escape(q["canonical_id"], quote=True)}" aria-label="{html.escape(q["display_name"], quote=True)}">{p}</g>')
    geometries.append(g)
    entities.append({'question_key': q['question_key'], 'display_name': q['display_name'], 'canonical_id': q['canonical_id'], 'source_feature_id': fid, 'dom_id': dom, 'polygon_parts': count, 'source_valid': valid, 'topology_repaired': not valid, 'live_eligible': False})
chunks.append('</g></svg>')
tree = STRtree(geometries)
overlaps = []
for i, g in enumerate(geometries):
    for j in tree.query(g):
        j = int(j)
        if j <= i: continue
        area = g.intersection(geometries[j]).area
        if area > 1e-10: overlaps.append({'a': entities[i]['canonical_id'], 'b': entities[j]['canonical_id'], 'square_degrees': area})
svg = ''.join(chunks).encode()
out = root / 'candidate'
out.mkdir(exist_ok=True)
(out / 'world.svg').write_bytes(svg)
manifest = {'schema_version': '1.0.0', 'purpose': 'Isolated diagnostic; identities and geometry are not fully reviewed for gameplay.', 'live_approved': False, 'boundary_policy': report['policy'], 'source': report['source'], 'coordinate_precision_decimal_degrees': 8, 'svg_sha256': hashlib.sha256(svg).hexdigest(), 'svg_bytes': len(svg), 'entities': entities, 'noninteractive_source_context': context, 'positive_area_overlaps': overlaps, 'overlap_threshold_square_degrees': 1e-10, 'limitations': ['Code corroboration does not establish geographic correctness.', 'Egypt was repaired with GEOS make_valid; repair requires geographic review.', 'No candidate reachability, hit testing, accessibility, performance, or live scoring approval is implied.', 'Context features are noninteractive and have not been assigned to game identities.']}
(out / 'world-manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
report['candidate_map_status'] = 'diagnostic_not_approved'
report['candidate_manifest'] = 'candidate/world-manifest.json'
report['candidate_svg_sha256'] = manifest['svg_sha256']
report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(f"Candidate: {len(entities)} mapped, {len(context)} context, {len(svg)} bytes, {len(overlaps)} positive-area overlaps; live approval remains false")
