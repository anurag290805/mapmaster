#!/usr/bin/env python3
"""Conservative source audit; never enables live questions or changes approved status."""
import collections, hashlib, html, io, json, pathlib, re, sys, zipfile
import shapefile
import shapely
from shapely.geometry import shape
from shapely.strtree import STRtree
from shapely.validation import explain_validity
ROOT=pathlib.Path(__file__).resolve().parent.parent
base=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/mapmaster-geodata')
registry_path=ROOT/'docs/engineering/CP05_GEO_REGISTRY.json'
registry=json.loads(registry_path.read_text())
req=json.loads((ROOT/'docs/engineering/CP05_GEO_REQUIREMENTS.json').read_text())
feas=json.loads((ROOT/'docs/engineering/CP05_GEO_FEASIBILITY.json').read_text())
pilot=json.loads((ROOT/'pilot/manifest.json').read_text())
archive=base/'ne_10m_admin_0_countries.zip'; un=base/'un-m49.html'
raw=archive.read_bytes(); digest=hashlib.sha256(raw).hexdigest()
if digest!=feas['layers'][archive.name]['sha256']: raise ValueError('Natural Earth source hash mismatch')
page=un.read_text(encoding='utf8'); table=page[page.index('<table class="table table-striped"'):]; table=table[:table.index('</table>')]
un_rows={}
for tr in re.findall(r'<tr\b[^>]*>(.*?)</tr>',table,re.S):
    cells=[html.unescape(re.sub(r'<[^>]*>','',v)).strip() for v in re.findall(r'<td\b[^>]*>(.*?)</td>',tr,re.S)]
    if len(cells)>=3 and re.fullmatch('[A-Z]{3}',cells[2]):
        if cells[2] in un_rows: raise ValueError('duplicate UN alpha3 '+cells[2])
        un_rows[cells[2]]={'name':cells[0],'m49':cells[1],'alpha3':cells[2]}
if len(un_rows)<240: raise ValueError('UN source table is incomplete')
with zipfile.ZipFile(archive) as z:
    version=z.read(next(n for n in z.namelist() if n.endswith('VERSION.txt'))).decode().strip()
    args={k:io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith('.'+k)))) for k in ('shp','shx','dbf')}
if version!='5.1.1': raise ValueError('unexpected version '+version)
reader=shapefile.Reader(**args,encoding='utf-8')
features={}
for item in reader.iterShapeRecords():
    props=item.record.as_dict(); ident=str(props['NE_ID'])
    if ident in features: raise ValueError('duplicate source NE_ID '+ident)
    features[ident]=(props,shape(item.shape.__geo_interface__))

def diagnostic_geometry(raw):
    """Return a non-runtime derived geometry while retaining raw-source facts."""
    source_valid = raw.is_valid and not raw.is_empty
    source_reason = explain_validity(raw)
    if source_valid:
        return raw, None, source_valid, source_reason
    repaired = shapely.make_valid(raw)
    if repaired.is_empty or not repaired.is_valid or repaired.geom_type not in ('Polygon', 'MultiPolygon'):
        raise ValueError('repair did not yield a valid polygonal geometry: ' + explain_validity(repaired))
    source_area = raw.area
    delta = abs(repaired.area - source_area)
    return repaired, {
        'method': 'GEOS make_valid',
        'source_geometry_sha256': hashlib.sha256(raw.wkb).hexdigest(),
        'derived_geometry_sha256': hashlib.sha256(repaired.wkb).hexdigest(),
        'source_area_square_degrees': source_area,
        'derived_area_square_degrees': repaired.area,
        'absolute_area_delta_square_degrees': delta,
        'relative_area_delta': delta / source_area if source_area else None,
        'representative_point_covered': repaired.covers(raw.representative_point()),
        'bounds_unchanged': tuple(raw.bounds) == tuple(repaired.bounds),
        'source_validity_reason': source_reason,
    }, source_valid, source_reason
world=next(s for s in req['scopes'] if s['scope']=='world')['questions']
lookup={o['question_key']:e for e in registry['entities'] for o in e['occurrences'] if o['scope']=='world'}
pilotids={e['id']:e for e in pilot['entities']}
questions=[]; geometry=[]
for q in world:
    entry=lookup[q['question_key']]; src=entry.get('source') or {}; fid=src.get('feature_id'); pair=features.get(fid)
    if not pair: raise ValueError('unresolved feature '+q['display_name'])
    p,raw_geometry=pair; code=entry['entity_id'].split(':')[-1]; source2=p['ISO_A2'] if re.fullmatch('[A-Z]{2}',p['ISO_A2']) else p['ISO_A2_EH']
    if code!=source2 or p['featurecla']!='Admin-0 country': raise ValueError('source identity/level conflict '+q['display_name'])
    alpha3=p['ISO_A3'] if p['ISO_A3'] in un_rows else p['ADM0_A3'] if p['ADM0_A3'] in un_rows else None
    unmatch=un_rows.get(alpha3)
    # The current M49 table groups Taiwan with China. The 1999 UN M49
    # edition explicitly records TW/TWN; use only for identifier corroboration.
    historical=None
    if code=='TW' and p['ISO_A3']=='TWN':
        historical={'alpha2':'TW','alpha3':'TWN','year':1999,'url':'https://unstats.un.org/unsd/publication/SeriesM/Series_M49_Rev4%281999%29_en.pdf','note':'Historical code evidence only; current UN M49 groups this area with China and no sovereignty position is inferred.'}
    identity='pilot_independently_checked' if entry['entity_id'] in pilotids else 'identifier_corroborated' if unmatch or historical else 'unresolved_independent_reference'
    g,repair,source_valid,source_validity_reason=diagnostic_geometry(raw_geometry)
    valid=g.is_valid and not g.is_empty
    status='pilot_checked_only' if entry['entity_id'] in pilotids and source_valid else 'repaired_source_geometry_not_reviewed' if repair else 'source_valid_not_reviewed'
    parts=len(g.geoms) if g.geom_type=='MultiPolygon' else 1
    flags=[]
    if not unmatch and not historical: flags.append('UN M49 alpha-3 correspondence not established; additional independent reference required')
    if historical: flags.append('historical UN code evidence does not resolve current statistical treatment or disputed sovereignty')
    if repair: flags.append('source geometry invalid: '+source_validity_reason+'; deterministic diagnostic repair retained for topology review')
    if entry['status']=='ambiguous': flags.append('cross-resolution discrepancy requires geometry review')
    if entry['status']=='policy-dependent': flags.append('sensitive/disputed boundary or identity requires explicit feature-level review')
    flags.append('full geometry, small-target interaction and live-session behavior are not verified')
    record={'question_key':q['question_key'],'display_name':q['display_name'],'canonical_id':entry['entity_id'], 'accepted_aliases':entry['approved_aliases'],'source_feature_id':fid,'source_dataset':'Natural Earth Admin-0 countries 1:10m','source_version':version,'source_sha256':digest,'source_codes':{'ISO_A2':p['ISO_A2'],'ISO_A2_EH':p['ISO_A2_EH'],'ISO_A3':p['ISO_A3'],'ADM0_A3':p['ADM0_A3']},'source_name':p['NAME'],'source_class':p['featurecla'],'source_type':p['TYPE'],'scope_membership':entry['scope_memberships'],'geometry_reference':f'{archive.name}#NE_ID={fid}','identity':{'status':identity,'m49':unmatch,'historical_reference':historical,'reference':'https://unstats.un.org/unsd/methodology/m49/','note':'M49 corroborates alpha-3 identity only; it does not validate borders or sovereignty.'},'geometry':{'status':status,'present':not g.is_empty,'valid':g.is_valid,'validity_reason':explain_validity(g),'source_valid':source_valid,'source_validity_reason':source_validity_reason,'type':g.geom_type,'polygon_parts':parts,'bounds':list(g.bounds),'geometry_sha256':hashlib.sha256(g.wkb).hexdigest(),'repair':repair,'overlaps':[],'note':'Checks use source geometry except a recorded deterministic diagnostic repair; full correctness and hit-testing are not established.'},'policy':{'status':'provisional_de_facto_not_feature_approved','watchlist':entry['status']=='policy-dependent','note':'Development view is de facto control, not a sovereignty assertion; alternate views and publication requirements remain to be evaluated.'},'license':'Natural Earth public domain: https://www.naturalearthdata.com/about/terms-of-use/','gates':{'live_eligible':False},'blockers':flags}
    questions.append(record);geometry.append(g)
# Diagnose source overlaps. Degrees-squared is a detection metric, not surface area.
valid_indices=[i for i,g in enumerate(geometry) if g.is_valid and not g.is_empty]
valid_geoms=[geometry[i] for i in valid_indices]; tree=STRtree(valid_geoms); overlap_count=0; checked=0
for local_i,g in enumerate(valid_geoms):
    for local_j in tree.query(g,predicate='intersects'):
        local_j=int(local_j)
        if local_j<=local_i: continue
        a,b=valid_indices[local_i],valid_indices[local_j];checked+=1
        try: area=g.intersection(valid_geoms[local_j]).area
        except Exception as ex:
            questions[a]['blockers'].append('overlap intersection failed with '+questions[b]['display_name']+': '+str(ex));continue
        if area>1e-10:
            overlap_count+=1
            for x,y in ((a,b),(b,a)):
                questions[x]['geometry']['overlaps'].append({'other':questions[y]['canonical_id'],'other_name':questions[y]['display_name'],'intersection_degrees_squared':round(area,12)})
for q in questions:
    if q['geometry']['overlaps']: q['blockers'].append('source polygons overlap other game features; hit resolution requires review')
# Egypt's source ring is invalid. Keep the source diagnosis above, and make
# the repair's containment/neighbor evidence explicit without treating either
# the raw source or these planar checks as a boundary approval.
by_id={q['canonical_id']:i for i,q in enumerate(questions)}
egypt=by_id.get('iso3166-1:EG')
if egypt is not None and questions[egypt]['geometry']['repair']:
    checks=[]
    for neighbor in ('IL','LY','SD'):
        other=by_id['iso3166-1:'+neighbor]
        checks.append({'canonical_id':'iso3166-1:'+neighbor,
                       'positive_area_overlap':round(geometry[egypt].intersection(geometry[other]).area,12),
                       'touches':geometry[egypt].touches(geometry[other])})
    questions[egypt]['geometry']['repair']['neighbor_checks']=checks
policy={'status':'provisional_de_facto','source':'User instruction 2026-11-01','meaning':'Default Natural Earth de facto control is a development baseline, not a sovereignty claim or approval of disputed identities. Preserve alternative views without changing canonical IDs or scoring. Verify Indian and other applicable mapping/distribution requirements before release.'}
report={'schema_version':'1.0.0','generated_for':'CP05 world coverage gate','candidate_map_status':'blocked_not_generated','live_integration_allowed':False,'policy':policy,'source':{'dataset':'Natural Earth 10m Admin-0 countries','version':version,'archive_sha256':digest,'archive_bytes':len(raw),'url':'https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_0_countries.zip','license':'Public domain; https://www.naturalearthdata.com/about/terms-of-use/'},'identity_reference':{'name':'UN M49 country or area / ISO-alpha3','url':'https://unstats.un.org/unsd/methodology/m49/','retrieved':'2026-11-01','html_sha256':hashlib.sha256(un.read_bytes()).hexdigest(),'entries_parsed':len(un_rows)},'overlap_method':{'valid_geometry_pair_checks':checked,'pairs_with_positive_intersection':overlap_count,'coordinate_system':'longitude/latitude; squared degrees','threshold':1e-10,'note':'Diagnostic only; excluded invalid shapes and does not prove semantic conflict or hit testing.'},'questions':questions}
(ROOT/'docs/engineering/CP05_WORLD_COVERAGE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
# Add evidence without changing canonical status or removing earlier work.
registry['world_development_policy']=policy
for q in questions:
    entry=lookup[q['question_key']]
    entry['world_coverage_evidence']={'source_10m_feature_id':q['source_feature_id'],'source_10m_valid':q['geometry']['valid'],'source_10m_parts':q['geometry']['polygon_parts'],'identity_status':q['identity']['status'],'m49':q['identity']['m49'],'policy_status':q['policy']['status'],'live_eligible':False}
registry_path.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
print('world',len(questions),'identity',dict(collections.Counter(q['identity']['status'] for q in questions)),'geometry',dict(collections.Counter(q['geometry']['status'] for q in questions)))
print('source overlap pairs',overlap_count,'examined',checked,'invalid',[(q['display_name'],q['geometry']['validity_reason']) for q in questions if not q['geometry']['valid']])
print('live eligible',sum(q['gates']['live_eligible'] for q in questions))
