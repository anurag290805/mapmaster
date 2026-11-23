#!/usr/bin/env python3
"""Build the isolated pilot from the checksum-pinned NE 10m archive and reviewed anchors."""
import hashlib, io, json, pathlib, sys, zipfile
import shapefile
from shapely.geometry import Point, shape
from shapely.ops import transform
ROOT=pathlib.Path(__file__).resolve().parent.parent
base=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/mapmaster-geodata')
file=base/'ne_10m_admin_0_countries.zip'
feas=json.loads((ROOT/'docs/engineering/CP05_GEO_FEASIBILITY.json').read_text())
digest=hashlib.sha256(file.read_bytes()).hexdigest()
assert digest==feas['layers'][file.name]['sha256'], 'source checksum mismatch'
# lon/lat landmarks are independent GeoNames coordinates; ISO3 is UN M49.
reviewed={
 'CA':('Canada','CAN','1159320467',-75.69812,45.41117,'https://www.geonames.org/6094817/ottawa.html'),
 'BR':('Brazil','BRA','1159320441',-47.92972,-15.77972,'https://www.geonames.org/3469058/brasilia.html'),
 'JP':('Japan','JPN','1159320937',139.69171,35.68950,'https://www.geonames.org/1850147/tokyo.html'),
 'NZ':('New Zealand','NZL','1159321135',174.77557,-41.28664,'https://www.geonames.org/2179537/wellington.html'),
 'PT':('Portugal','PRT','1159321187',-9.150,38.725,'https://www.geonames.org/PT/largest-cities-in-portugal.html'),
 'MT':('Malta','MLT','1159321065',14.5125,35.89833,'https://www.geonames.org/8334638/valletta.html'),
 'ZA':('South Africa','ZAF','1159321431',28.18783,-25.74486,'https://www.geonames.org/964137/pretoria.html'),
 'CV':('Cabo Verde','CPV','1159320523',-23.51254,14.93152,'https://www.geonames.org/3374333/praia.html'),
}
reg=json.loads((ROOT/'docs/engineering/CP05_GEO_REGISTRY.json').read_text())
with zipfile.ZipFile(file) as z:
 args={k:io.BytesIO(z.read(next(p for p in z.namelist() if p.endswith('.'+k)))) for k in ('shp','shx','dbf')}
reader=shapefile.Reader(**args,encoding='utf-8')
features={str(sr.record.as_dict()['NE_ID']):(sr.record.as_dict(),shape(sr.shape.__geo_interface__)) for sr in reader.iterShapeRecords() if str(sr.record.as_dict()['NE_ID']) in {v[2] for v in reviewed.values()}}
entries=[]; groups=[]
def ring(coords): return 'M'+' '.join(f'{x+180:.4f},{90-y:.4f}' for x,y in coords)+'Z'
for code,(name,iso3,neid,lon,lat,anchor_url) in reviewed.items():
 prop,geom=features[neid]; match=next(e for e in reg['entities'] if e['entity_id']=='iso3166-1:'+code)
 assert match['status']=='reconciled' and prop['featurecla']=='Admin-0 country'
 assert prop['ISO_A3']==iso3 and prop['ISO_A2']==code and geom.is_valid and not geom.is_empty
 assert geom.covers(Point(lon,lat)), f'{name} landmark not in source polygon'
 simplified=geom.simplify(0.005,preserve_topology=True)
 assert simplified.is_valid and simplified.covers(Point(lon,lat))
 rounded=transform(lambda x,y,z=None: (round(x,4),round(y,4)),simplified)
 assert rounded.is_valid and not rounded.is_empty and rounded.covers(Point(lon,lat)), f'{name} rounded geometry invalid or lost landmark'
 simplified=rounded
 polygons=list(simplified.geoms) if simplified.geom_type=='MultiPolygon' else [simplified]
 paths=[]
 for i,p in enumerate(polygons):
  d=ring(p.exterior.coords)+''.join(ring(h.coords) for h in p.interiors)
  paths.append(f'<path id="pilot-{code}-{i}" data-entity="iso3166-1:{code}" fill-rule="evenodd" d="{d}"/>')
 groups.append(f'<g id="country-{code}" data-entity="iso3166-1:{code}" tabindex="0" role="button" aria-label="{name}">'+''.join(paths)+'</g>')
 entries.append({'id':'iso3166-1:'+code,'name':name,'iso3':iso3,'ne_id':neid,'source_name':prop['NAME'],'source_type':prop['TYPE'],'landmark':{'lon':lon,'lat':lat,'source':anchor_url,'attribution':'GeoNames','license':'CC BY 4.0','license_url':'https://creativecommons.org/licenses/by/4.0/'},'source_geometry_valid':geom.is_valid,'simplified_geometry_valid':simplified.is_valid,'rounded_geometry_valid':rounded.is_valid,'source_parts':len(geom.geoms) if geom.geom_type=='MultiPolygon' else 1,'rendered_parts':len(polygons),'geometry_reference':f'{file.name}#NE_ID={neid}','identity_evidence':'https://unstats.un.org/unsd/methodology/m49/'})
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180" role="group" aria-label="Pilot map of selected countries">'+''.join(groups)+'</svg>\n'
manifest={'schema_version':1,'source':{'name':'Natural Earth 1:10m Admin-0 countries','version':'5.1.1','sha256':digest,'url':'https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_0_countries.zip','license':'Public domain','terms':'https://www.naturalearthdata.com/about/terms-of-use/','boundary_policy':'Natural Earth default de facto; pilot only, not product policy'},'simplification_degrees':0.005,'rounding_decimal_places':4,'entities':entries,'excluded_world':[{'name':o['display_name'],'status':e['status'],'reason':('Suva independent landmark falls outside the source polygon' if o['display_name']=='Fiji' else 'outside reviewed subset' if e['status']=='reconciled' else 'unresolved '+e['status'])} for e in reg['entities'] for o in e['occurrences'] if o['scope']=='world' and o['display_name'] not in {v[0] for v in reviewed.values()}]}
(ROOT/'pilot/map.svg').write_text(svg)
(ROOT/'pilot/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Generated',len(entries),'countries,',sum(e['rendered_parts'] for e in entries),'polygon parts;',len(svg.encode()),'bytes')
