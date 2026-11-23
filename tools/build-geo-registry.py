#!/usr/bin/env python3
"""Build a non-runtime reconciliation ledger; sources must match recorded hashes."""
import collections, hashlib, io, json, pathlib, re, subprocess, sys, unicodedata, xml.etree.ElementTree as ET, zipfile
import shapefile
from shapely.geometry import shape
from shapely.validation import explain_validity
ROOT=pathlib.Path(__file__).resolve().parent.parent
base=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/mapmaster-geodata')
req=json.loads((ROOT/'docs/engineering/CP05_GEO_REQUIREMENTS.json').read_text())
feas=json.loads((ROOT/'docs/engineering/CP05_GEO_FEASIBILITY.json').read_text())
game_script="""const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('js/data.js','utf8')+';this.data={MAPS,FLAGS,INDIA_UTS}',c);const s=fs.readFileSync('js/ui.js','utf8');vm.runInContext(s.slice(s.indexOf('const SVG_ALIASES ='),s.indexOf('// Reverse map:'))+';this.aliases=SVG_ALIASES',c);console.log(JSON.stringify({...c.data,aliases:c.aliases}));"""
game=json.loads(subprocess.check_output(['node','-e',game_script],cwd=ROOT,text=True))
for path, digest in [(base/'ne_10m_admin_1_states_provinces.zip',feas['layers']['ne_10m_admin_1_states_provinces.zip']['sha256']),(base/'geoboundaries-ind-adm1.geojson',feas['geoboundaries_india']['sha256'])]:
    if hashlib.sha256(path.read_bytes()).hexdigest()!=digest: raise ValueError('source checksum mismatch: '+str(path))

def norm(x): return ''.join(c for c in unicodedata.normalize('NFKD',x.casefold()) if c.isalnum() and not unicodedata.combining(c))
def flag_code(flag):
    vals=[ord(c)-0x1f1e6 for c in flag]
    return ''.join(chr(65+n) for n in vals) if len(vals)==2 and all(0<=n<26 for n in vals) else None
def load_layer(name):
    path=base/name
    if hashlib.sha256(path.read_bytes()).hexdigest()!=feas['layers'][name]['sha256']: raise ValueError('source checksum mismatch: '+name)
    with zipfile.ZipFile(path) as z:
        args={k:io.BytesIO(z.read(next(p for p in z.namelist() if p.endswith('.'+k)))) for k in ('shp','shx','dbf')}
    r=shapefile.Reader(**args,encoding='utf-8'); out={}
    for sr in r.iterShapeRecords():
        d=sr.record.as_dict(); key=str(d['NE_ID']); g=shape(sr.shape.__geo_interface__)
        out[key]=(d,g)
    return out
small=load_layer('ne_50m_admin_0_countries.zip')
large=load_layer('ne_10m_admin_0_countries.zip')
country_scopes={'world','europe','northAmerica','southAmerica','africa','asia','oceania'}
policy={'IN','PK','CN','RU','UA','PS','IL','MA','CY','TW','GE','AM','AZ','RS','SO','SD','SS','EG','SY','TR','IQ','IR'}
country_by_code=collections.defaultdict(list)
country_by_exact_code=collections.defaultdict(list)
for ident,(props,geom) in small.items():
    code=props.get('ISO_A2_EH');
    if code and re.fullmatch('[A-Z]{2}',code): country_by_code[code].append(ident)
    exact=props.get('ISO_A2')
    if exact and re.fullmatch('[A-Z]{2}',exact): country_by_exact_code[exact].append(ident)

# Legacy IDs are used only as a separate game-side identifier assertion, not geometry validation.
def scope_codes(scope):
    mapping=collections.defaultdict(set)
    for p in ET.parse(ROOT/scope['asset']).getroot().iter('{http://www.w3.org/2000/svg}path'):
        code=(p.get('id') or '').upper()
        if not re.fullmatch('[A-Z]{2}',code): continue
        name=next((p.get(k) for k in ('aria-label','name','data-name','title') if p.get(k)),None)
        if name:
            mapping[norm(name)].add(code)
            mapping[norm(game['aliases'].get(name,name))].add(code)
        if code in game['aliases']: mapping[norm(game['aliases'][code])].add(code)
    return mapping

def geometry_evidence(code,ident):
    p,g=small[ident]; l=large.get(ident); comp=None
    if l and not g.is_empty and not l[1].is_empty and g.is_valid and l[1].is_valid:
        u=g.union(l[1]).area
        comp=round(g.intersection(l[1]).area/u,6) if u else None
    return {'dataset':'Natural Earth Admin-0 countries','version':'5.1.1','feature_id':ident,'source_level':'admin0',
       'source_iso':code,'source_iso_fields':{'ISO_A2':p.get('ISO_A2'),'ISO_A2_EH':p.get('ISO_A2_EH'),'ADM0_A3':p.get('ADM0_A3')},'geometry_present':not g.is_empty,'geometry_valid':g.is_valid,'geometry_type':g.geom_type,
       'geometry_reference':f'ne_50m_admin_0_countries.zip#NE_ID={ident}',
       'archive_sha256':feas['layers']['ne_50m_admin_0_countries.zip']['sha256'],
       'comparison_10m_same_feature_iou_lonlat':comp,
       'validity_reason':explain_validity(g), 'source_name':p.get('NAME'), 'source_type':p.get('TYPE'),
       'license':'Natural Earth public domain; https://www.naturalearthdata.com/about/terms-of-use/'}

def subdivision_ids(scope):
    result=collections.defaultdict(set)
    for p in ET.parse(ROOT/scope['asset']).getroot().iter('{http://www.w3.org/2000/svg}path'):
        raw=next((p.get(k) for k in ('aria-label','name','data-name','title') if p.get(k)),None)
        if raw and p.get('id'):
            result[norm(raw)].add(p.get('id').upper())
            result[norm(game['aliases'].get(raw,raw))].add(p.get('id').upper())
    return result

world_scope=next(x for x in req['scopes'] if x['scope']=='world')
world_codes=scope_codes(world_scope)
feas_scopes={x['scope']:x for x in feas['scope_feasibility']}
india_candidates={x['question_key']:x for x in feas_scopes['india']['questions'] + feas['india_bonus_feasibility']}

def india_entry(q,occurrence):
    candidates=india_candidates[q['question_key']]['candidate_features_by_layer']
    ne=candidates.get('ne_10m_admin_1_states_provinces.zip',[])
    gb=candidates.get('geoboundaries-ind-adm1.geojson',[])
    if len(ne)==1 and len(gb)==1 and ne[0].get('iso') and ne[0]['iso']==gb[0].get('shapeISO'):
        code=ne[0]['iso']; eid='source-pair:india:'+code
        src={'dataset':'Natural Earth Admin-1 states and provinces','version':'5.1.1','feature_id':ne[0]['source_id'],'source_level':'admin1','source_iso':code,'geometry_reference':'ne_10m_admin_1_states_provinces.zip#adm1_code='+ne[0]['source_id'],'archive_sha256':feas['layers']['ne_10m_admin_1_states_provinces.zip']['sha256'],'geometry_present':True,'geometry_valid':not any(x['id']==ne[0]['source_id'] for x in feas['layers']['ne_10m_admin_1_states_provinces.zip']['invalid_geometries']),'license':'Natural Earth public domain'}
        evidence={'shared_source_code':code,'second_dataset':'geoBoundaries gbOpen IND ADM1','second_feature_id':gb[0]['shapeID'],'second_geometry_reference':'geoBoundaries-IND-ADM1_simplified.geojson#shapeID='+gb[0]['shapeID'],'second_archive_sha256':feas['geoboundaries_india']['sha256'],'second_license':'source metadata CC BY 2.5 India; gbOpen attribution applies','reason':'both datasets assign the same subdivision code; administrative type, date, and disputed geometry still need independent review'}
        return eid, {'entity_id':eid,'entity_type':'state_as_configured' if q['question_key'].startswith('india:') else 'union_territory_as_configured','display_name':q['display_name'],'approved_aliases':[],'parent':'india','scope_memberships':['india'],'occurrences':[occurrence],'status':'policy-dependent','source':src,'evidence':evidence,'policy_notes':['source year inconsistency and political boundary policy unresolved','source-pair identifier is provisional, not a claim of current ISO status']}
    return None,None

groups={}; expected=[]
for scope in req['scopes']:
    key=scope['scope']; codes=scope_codes(scope) if key in country_scopes else subdivision_ids(scope)
    for q in scope['questions']:
        expected.append(q['question_key']); name=q['display_name']; occurrence={'question_key':q['question_key'],'scope':key,'display_name':name,'modes':{'name':q['runtime_name_mode'],'locate_expected':q['expected_locate'],'flag_data':q['runtime_flag_data_available'],'capital_data':q['runtime_capital_data_available']}}
        if key not in country_scopes:
            if key=='india':
                pair_id,pair=india_entry(q,occurrence)
                if pair_id: groups[pair_id]=pair; continue
            eid='unresolved:'+q['question_key']
            potential=next(x for x in feas_scopes[key]['questions'] if x['question_key']==q['question_key'])['candidate_features_by_layer']['ne_10m_admin_1_states_provinces.zip']
            old_ids=sorted(codes.get(norm(name),set()))
            supported=[c for c in potential if c.get('iso') and any(re.sub('[^A-Z0-9]','',c['iso'].upper())==i or c['iso'].upper().split('-')[-1]==i for i in old_ids)]
            evidence={'reason':'administrative identity and level require jurisdiction-specific verification; existing SVG identifiers are untrusted','legacy_svg_ids':old_ids,'natural_earth_candidates':potential,'candidate_codes_corroborated_by_legacy_id':supported}
            groups[eid]={'entity_id':eid,'entity_type':'subdivision_or_special_region_unverified','display_name':name,'approved_aliases':[],'parent':key,'scope_memberships':[key],'occurrences':[occurrence],'status':'ambiguous','source':None,'evidence':evidence,'policy_notes':['unapproved provisional question record; not a canonical identity']}
            continue
        signals=set(codes.get(norm(name),set())); world_fallback=[]
        fc=flag_code(game['FLAGS'].get(name,''))
        if fc: signals.add(fc)
        # For a regional question with no local code, corroborate a world-scope code
        # against the unique source feature discovered for the same question.
        if not signals and key!='world':
            wc=world_codes.get(norm(name),set())
            candidate=next(x for x in feas_scopes[key]['questions'] if x['question_key']==q['question_key'])['candidate_features_by_layer']['ne_50m_admin_0_countries.zip']
            source_ids={c['source_id'] for c in candidate}
            confirmed={c for c in wc if len(country_by_exact_code.get(c,[]))==1 and country_by_exact_code[c][0] in source_ids}
            signals.update(confirmed); world_fallback=sorted(confirmed)
        if len(signals)!=1:
            eid='unresolved:'+q['question_key']; reason='no unique independent game-side country code' if not signals else 'conflicting game-side country codes: '+','.join(sorted(signals))
            groups[eid]={'entity_id':eid,'entity_type':'country_or_territory_unverified','display_name':name,'approved_aliases':[],'parent':None,'scope_memberships':[key],'occurrences':[occurrence],'status':'ambiguous','source':None,'evidence':{'reason':reason,'game_codes':sorted(signals)},'policy_notes':['unapproved provisional question record; not a canonical identity']}
            continue
        code=next(iter(signals)); candidates=country_by_exact_code.get(code,[]) or country_by_code.get(code,[])
        if len(candidates)!=1:
            eid='unresolved:'+q['question_key']; groups[eid]={'entity_id':eid,'entity_type':'country_or_territory_unverified','display_name':name,'approved_aliases':[],'parent':None,'scope_memberships':[key],'occurrences':[occurrence],'status':'ambiguous' if candidates else 'missing','source':None,'evidence':{'reason':'source code does not uniquely identify an Admin-0 feature','game_code':code,'candidates':candidates},'policy_notes':['unapproved provisional question record; not a canonical identity']}; continue
        ident=candidates[0]; src=geometry_evidence(code,ident); eid='iso3166-1:'+code
        # Check a second scale when possible; feature identity is not established by a name alone.
        iou=src['comparison_10m_same_feature_iou_lonlat']
        status='policy-dependent' if code in policy else 'reconciled' if src['geometry_valid'] and src['geometry_present'] and iou is not None and iou>=0.5 else 'ambiguous'
        if eid not in groups:
            groups[eid]={'entity_id':eid,'entity_type':'country','display_name':name,'approved_aliases':[],'observed_display_names':[name],'parent':None,'scope_memberships':[],'occurrences':[],'status':status,'source':src,'evidence':{'independent_game_iso':code,'game_identifier_evidence':[],'method':'game flag or legacy SVG country code corroborates Natural Earth ISO_A2_EH; 50m geometry checked for presence, GEOS validity and overlap with matching 10m NE_ID; source labels are not the authority','geometry_review':'automated cross-scale check only; no manual boundary or hit-test approval'},'policy_notes':['Natural Earth default de facto boundaries; product policy and gameplay approval remain unresolved']}
        g=groups[eid]; g['occurrences'].append(occurrence)
        if key not in g['scope_memberships']: g['scope_memberships'].append(key)
        g['evidence']['game_identifier_evidence'].append({'question_key':q['question_key'],'code':code,'flag_code':fc,'svg_codes':sorted(codes.get(norm(name),set())),'world_svg_fallback_codes':world_fallback})
        if name not in g['observed_display_names']: g['observed_display_names'].append(name)
for q in req['india_bonus_union_territories']:
    expected.append(q['question_key']); occurrence={'question_key':q['question_key'],'scope':'india','display_name':q['display_name'],'modes':{'typing_bonus':True}}
    eid,entry=india_entry(q,occurrence)
    if eid: groups[eid]=entry
    else:
        eid='unresolved:'+q['question_key']; groups[eid]={'entity_id':eid,'entity_type':'union_territory_unverified','display_name':q['display_name'],'approved_aliases':[],'parent':'india','scope_memberships':['india'],'occurrences':[occurrence],'status':'ambiguous','source':None,'evidence':{'reason':'India administrative sources and date require review; candidates in CP05_GEO_FEASIBILITY.json'},'policy_notes':['unapproved provisional question record; not a canonical identity']}
for entry in groups.values():
    if entry['status']=='reconciled': continue
    if entry['entity_type']=='country':
        if entry['status']=='policy-dependent':
            entry['resolution']={'options':['Document and apply a consistent boundary and territory policy','Investigate a suitable alternate point of view'], 'recommendation':'Review the specific feature under the adopted product policy before gameplay approval', 'gameplay_consequence':'Keep the existing map; do not admit this feature into a replacement pilot'}
        else:
            entry['resolution']={'options':['Inspect the 10m and 50m features and source records','Use independently verified appropriate-scale geometry and an accessible small-target mechanism'], 'recommendation':'Resolve geometry and hit-testing before approval', 'gameplay_consequence':'A replacement pilot excluding this target would lose configured world coverage'}
    elif entry['parent']=='india':
        entry['resolution']={'options':['Trace gbOpen source revisions and effective date','Compare jurisdiction, classification and boundaries against reliable India administrative data'], 'recommendation':'Verify source recency and boundary policy before accepting either source association', 'gameplay_consequence':'Retain current India questions and bonus behavior pending review'}
    else:
        entry['resolution']={'options':['Verify jurisdiction and administrative code against an independent dataset','Obtain or aggregate independently verified geometry at the required level'], 'recommendation':'Use source candidates and legacy code corroboration as a review queue, not as approval', 'gameplay_consequence':'Retain existing map; replacement could misidentify or omit a question'}
out={'schema_version':'0.1.0','purpose':'reconciliation ledger only; not approved for gameplay','gameplay_approval':False,'source_policy':'Natural Earth default de facto; product boundary policy not adopted','expected_occurrences':expected,'entities':list(groups.values()),'count_warning':'Unresolved question records are not necessarily unique geographic entities; exact distinct-entity count remains undetermined.'}
(ROOT/'docs/engineering/CP05_GEO_REGISTRY.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('records',len(groups),'occurrences',len(expected),'statuses',dict(collections.Counter(x['status'] for x in groups.values())))
print('country groups',sum(x['entity_id'].startswith('iso3166-1:') for x in groups.values()))
