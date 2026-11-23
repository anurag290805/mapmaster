const {test} = require('node:test');
const assert = require('node:assert/strict');
const core = () => import('../pilot/core.mjs');

test('selection scores only an eligible exact canonical identity', async () => {
  const {evaluateSelection} = await core();
  const allowed=new Set(['iso3166-1:CA','iso3166-1:BR']);
  assert.equal(evaluateSelection('iso3166-1:CA','iso3166-1:CA',allowed),'correct');
  assert.equal(evaluateSelection('iso3166-1:CA','iso3166-1:BR',allowed),'wrong');
  assert.equal(evaluateSelection('iso3166-1:CA','iso3166-1:XX',allowed),'ignored');
});
test('obsolete loads and listeners cannot own the current session', async () => {
  const {createOwner}=await core(); const o=createOwner(); const old=o.next();
  assert.equal(o.current(old),true); const active=o.next();
  assert.equal(o.current(old),false); assert.equal(o.current(active),true); o.dispose(); assert.equal(o.current(active),false);
});
test('view transformations clamp scale and pan, and reset is neutral', async () => {
  const {clampView,resetView}=await core();
  assert.deepEqual(clampView({scale:20,x:900,y:-900}),{scale:5,x:720,y:-360});
  assert.deepEqual(clampView({scale:0,x:50,y:20}),{scale:1,x:0,y:0});
  assert.deepEqual(resetView(),{scale:1,x:0,y:0});
});
test('pilot fixture has unique identities and preserves multipart association', () => {
  const fs=require('node:fs'); const manifest=JSON.parse(fs.readFileSync('pilot/manifest.json','utf8'));const svg=fs.readFileSync('pilot/map.svg','utf8');
  assert.equal(manifest.entities.length,8);assert.equal(new Set(manifest.entities.map(x=>x.id)).size,8);
  const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  for(const e of manifest.entities){assert.equal(e.source_geometry_valid,true);assert.equal(e.simplified_geometry_valid,true);assert.equal(e.rounded_geometry_valid,true);assert.equal(e.source_parts,e.rendered_parts);assert.ok(e.rendered_parts>0);const code=e.id.slice(-2);const group=svg.match(new RegExp(`<g id=\"country-${code}\"[^>]*>(.*?)</g>`,'s'));assert.ok(group,`missing ${code}`);const parts=[...group[1].matchAll(/<path [^>]*data-entity="([^"]+)"/g)];assert.equal(parts.length,e.rendered_parts);assert.ok(parts.every(p=>p[1]===e.id));}
  assert.ok(manifest.entities.some(e=>e.rendered_parts>1));assert.equal(manifest.entities.some(e=>e.id==='iso3166-1:FJ'),false);assert.equal(manifest.excluded_world.length,186);
});
