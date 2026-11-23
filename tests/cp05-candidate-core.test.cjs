const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('candidate adapter requires one unique canonical target per manifest entity',async()=>{
  const {candidateEntities}=await import('../pilot/candidate-core.mjs');
  const m=JSON.parse(fs.readFileSync('candidate/world-manifest.json','utf8'));
  const entities=candidateEntities(m);
  assert.equal(entities.length,194);
  assert.equal(entities[0].id,'iso3166-1:AF');
  assert.equal(entities[0].name,'Afghanistan');
  assert.throws(()=>candidateEntities({...m,entities:[m.entities[0],m.entities[0]]}),/duplicate/i);
  assert.throws(()=>candidateEntities({...m,entities:[{...m.entities[0],canonical_id:''}]}),/identity/i);
});
