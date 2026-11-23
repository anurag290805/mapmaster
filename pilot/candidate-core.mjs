// Adapt the diagnostic manifest to the pilot's stable logical identities.
export function candidateEntities(manifest) {
  const ids=new Set(), domIds=new Set();
  if (!Array.isArray(manifest.entities)) throw new Error('Missing candidate entities');
  return manifest.entities.map(entity=>{
    if (!/^iso3166-1:[A-Z]{2}$/.test(entity.canonical_id || '') || !entity.display_name || !entity.dom_id) throw new Error('Invalid candidate identity');
    if (ids.has(entity.canonical_id) || domIds.has(entity.dom_id)) throw new Error('Duplicate candidate identity');
    ids.add(entity.canonical_id);domIds.add(entity.dom_id);
    return {id:entity.canonical_id,name:entity.display_name,domId:entity.dom_id,parts:entity.polygon_parts};
  });
}
