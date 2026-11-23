#!/usr/bin/env python3
"""Offline evidence generator. Requires temporary pyshp and shapely; no identity inference."""
import collections, hashlib, io, json, pathlib, sys, unicodedata, zipfile
import shapefile
from shapely.geometry import shape
from shapely.validation import explain_validity

base = pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/mapmaster-geodata')
requirements = json.loads(pathlib.Path('docs/engineering/CP05_GEO_REQUIREMENTS.json').read_text())
def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFKD',s.casefold()) if c.isalnum() and not unicodedata.combining(c))
def source(path):
    with zipfile.ZipFile(path) as z:
        v = z.read(next(x for x in z.namelist() if x.endswith('VERSION.txt'))).decode().strip()
        parts = {x: io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith('.'+x)))) for x in ('shp','shx','dbf')}
    reader = shapefile.Reader(**parts, encoding='utf-8')
    return v, list(reader.iterShapeRecords())
files = sorted(base.glob('ne_*zip'))
layers = {}
index = {}
for path in files:
    version, records = source(path)
    if version != '5.1.1': raise ValueError(f'{path.name}: expected 5.1.1, got {version}')
    adm1 = 'admin_1' in path.name
    keys = ('name','name_en') if adm1 else ('NAME','NAME_LONG','ADMIN','NAME_EN')
    lookup = collections.defaultdict(list)
    invalid = []
    empty = []
    identifiers = collections.Counter()
    geometry_types = collections.Counter()
    for rec in records:
        props = rec.record.as_dict()
        ident = str(props.get('adm1_code') if adm1 else props.get('NE_ID'))
        identifiers[ident] += 1
        geom = shape(rec.shape.__geo_interface__)
        geometry_types[geom.geom_type] += 1
        if geom.is_empty: empty.append(ident)
        if not geom.is_valid: invalid.append({'id':ident,'reason':explain_validity(geom)})
        candidate = {'source_id':ident,'name':props.get('name') if adm1 else props.get('NAME'), 'iso':props.get('iso_3166_2') if adm1 else props.get('ISO_A3'), 'parent_iso':props.get('iso_a2') if adm1 else None}
        for name in {props.get(k) for k in keys}:
            if isinstance(name,str) and name.strip(): lookup[norm(name)].append(candidate)
    for k in lookup:
        lookup[k] = list({c['source_id']:c for c in lookup[k]}.values())
    index[path.name] = lookup
    layers[path.name] = {'version':version,'archive_bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'feature_count':len(records),'geometry_types':dict(geometry_types),'invalid_geometries':invalid,'empty_geometry_ids':empty,'duplicate_source_ids':{k:v for k,v in identifiers.items() if v>1},'source_url':f'https://naturalearth.s3.amazonaws.com/{path.name.split("_")[1]}_cultural/{path.name}','license':'Natural Earth public domain; https://www.naturalearthdata.com/about/terms-of-use/'}
# Parent codes are used only to narrow candidate searches, not to approve identities.
iso = dict(india='IN',usa='US',canada='CA',australia='AU',japan='JP',germany='DE',china='CN',brazil='BR',spain='ES',uae='AE',argentina='AR',france='FR',indonesia='ID',italy='IT',mexico='MX',nigeria='NG',pakistan='PK',russia='RU',southKorea='KR',turkey='TR',egypt='EG',southAfrica='ZA',thailand='TH',vietnam='VN',greece='GR')
scopes=[]
for scope in requirements['scopes']:
    results=[]
    for q in scope['questions']:
        candidates={}
        for filename, lookup in index.items():
            if (scope['scope'] in iso) != ('admin_1' in filename): continue
            found=lookup.get(norm(q['display_name']),[])
            if scope['scope'] in iso: found=[c for c in found if c['parent_iso']==iso[scope['scope']]]
            candidates[filename]=found
        results.append({'question_key':q['question_key'],'name':q['display_name'],'canonical_entity_id':None,'classification':'requires_separately_verified_subdivision_dataset' if scope['scope'] in iso else 'unsupported_pending_identity_and_policy_review','candidate_features_by_layer':candidates,'candidate_method':'accent/punctuation-insensitive equality; discovery only, not a mapping'})
    scopes.append({'scope':scope['scope'],'questions':results})
gbpath=base/'geoboundaries-ind-adm1.geojson'
gb=json.loads(gbpath.read_text())
gbinvalid=[]
for f in gb['features']:
    g=shape(f['geometry'])
    if not g.is_valid: gbinvalid.append({'id':f['properties']['shapeID'],'reason':explain_validity(g)})
gblookup=collections.defaultdict(list)
for f in gb['features']:
    gblookup[norm(f['properties']['shapeName'])].append(f['properties'])
india_scope=next(s for s in scopes if s['scope']=='india')
for q in india_scope['questions']:
    q['candidate_features_by_layer']['geoboundaries-ind-adm1.geojson']=gblookup.get(norm(q['name']),[])
bonus=[]
for q in requirements['india_bonus_union_territories']:
    bonus.append({'question_key':q['question_key'],'name':q['display_name'],'canonical_entity_id':None,'classification':'requires_separately_verified_subdivision_dataset','expected_locate':False,'candidate_features_by_layer':{'geoboundaries-ind-adm1.geojson':gblookup.get(norm(q['display_name']),[]),'ne_10m_admin_1_states_provinces.zip':[c for c in index['ne_10m_admin_1_states_provinces.zip'].get(norm(q['display_name']),[]) if c['parent_iso']=='IN']}})
gbmeta={'url':'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/IND/ADM1/geoBoundaries-IND-ADM1_simplified.geojson','metadata':'https://www.geoboundaries.org/api/current/gbOpen/IND/ADM1/','pinned_commit':'9469f09','metadata_boundary_id':'IND-ADM1-1811400','represented_year_as_reported':'2011','source_license_as_reported':'CC BY 2.5 India','size':gbpath.stat().st_size,'sha256':hashlib.sha256(gbpath.read_bytes()).hexdigest(),'feature_count':len(gb['features']),'invalid_geometries':gbinvalid,'features':[f['properties'] for f in gb['features']]}
out={'schema_version':1,'method':'Candidate equality is not verified identity, coverage, or policy approval. No source feature is approved for gameplay.','layers':layers,'geoboundaries_india':gbmeta,'scope_feasibility':scopes,'india_bonus_feasibility':bonus,'acceptance':'failed: identity reconciliation, policy, and reachability remain unverified'}
pathlib.Path('docs/engineering/CP05_GEO_FEASIBILITY.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
for k,v in layers.items(): print(k, v['version'],v['feature_count'],'invalid',len(v['invalid_geometries']),'duplicate IDs',len(v['duplicate_source_ids']),'bytes',v['archive_bytes'])
print('India gbOpen',gbmeta['feature_count'],'invalid',len(gbinvalid))
