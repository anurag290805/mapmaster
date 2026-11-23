import json,zipfile,io,shapefile,hashlib,pathlib,sys
from shapely.geometry import shape
r=json.load(open('docs/engineering/CP05_GEO_REGISTRY.json'))
ids={e['source']['feature_id']:e['display_name'] for e in r['entities'] if e['status']=='ambiguous' and e.get('source') and e['entity_type']=='country'}
base=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/mapmaster-geodata')
feas=json.load(open('docs/engineering/CP05_GEO_FEASIBILITY.json'))
for res in ('50m','10m'):
 name='ne_'+res+'_admin_0_countries.zip';path=base/name
 if hashlib.sha256(path.read_bytes()).hexdigest()!=feas['layers'][name]['sha256']: raise ValueError('checksum mismatch '+name)
 z=zipfile.ZipFile(path);args={x:io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith('.'+x)))) for x in ('shp','shx','dbf')};reader=shapefile.Reader(**args)
 for sr in reader.iterShapeRecords():
  i=str(sr.record.as_dict()['NE_ID'])
  if i in ids:
   g=shape(sr.shape.__geo_interface__); print(ids[i],res,'type',g.geom_type,'parts',len(g.geoms) if hasattr(g,'geoms') else 1,'bounds',tuple(round(x,4) for x in g.bounds),'area',round(g.area,7))
