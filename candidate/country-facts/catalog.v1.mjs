import { RAW_TERRAIN_EVIDENCE, SOURCE_SNAPSHOT } from "./snapshots/wikidata-country-terrain.v1.mjs";

export const COUNTRY_FACT_STATUS = Object.freeze({
  technical_validation: "accepted",
  factual_review: "source_qualified_pending_independent_review",
  founder_approval: "pending_founder_approval",
  gameplay_approval: "not_approved",
  production_eligible: false,
  development_preview_only: true,
});

function canonicalSlug(displayName) {
  return displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function canonicalCountryId(displayName) {
  return `mapmaster:country:${canonicalSlug(displayName)}`;
}

function stableContentHash(value) {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function factFor(displayName, feature, isWater) {
  if (isWater) {
    return `The Gambia's frozen source record links the country to the Atlantic Ocean, a coastal setting that shapes its narrow east–west geography.`;
  }
  return `${feature} is listed as ${displayName}'s highest point in this frozen source record, highlighting a named feature in the country's physical geography.`;
}

function reviewStatus(note) {
  if (!note) return COUNTRY_FACT_STATUS.factual_review;
  if (note.includes("pending secondary")) return "needs_secondary_source_review";
  if (note.includes("scope") || note.includes("boundary") || note.includes("sovereignty") || note.includes("Political-entity")) {
    return "needs_geographic_policy_review";
  }
  return "needs_editorial_review";
}

export const COUNTRY_FACT_CATALOG = Object.freeze(
  RAW_TERRAIN_EVIDENCE.map(([display_name, source_country_id, feature_name, source_feature_id, qualifier]) => {
    const coastal = display_name === "Gambia";
    const fact = factFor(display_name, feature_name, coastal);
    const canonical_id = canonicalCountryId(display_name);
    const source_property = coastal ? "P206" : "P610";
    const source_claim_label = coastal ? "body of water" : "highest point";
    const factual_review = reviewStatus(qualifier);
    const content_hash = stableContentHash([canonical_id, fact, source_country_id, source_feature_id, qualifier || ""].join("\\n"));
    return Object.freeze({
      canonical_id,
      display_name,
      gameplay_identity: display_name,
      proposed_fact: fact,
      source: Object.freeze({
        snapshot_id: SOURCE_SNAPSHOT.id,
        source_organization: SOURCE_SNAPSHOT.source_organization,
        retrieved_at: SOURCE_SNAPSHOT.retrieved_at,
        country_entity_id: source_country_id,
        feature_entity_id: source_feature_id,
        property: source_property,
        claim_label: source_claim_label,
        country_url: `https://www.wikidata.org/wiki/${source_country_id}#${source_property}`,
        feature_url: `https://www.wikidata.org/wiki/${source_feature_id}`,
        specific_evidence: coastal
          ? `Wikidata claim P206 (body of water) links ${display_name} to ${feature_name}.`
          : `Wikidata claim P610 (highest point) links ${display_name} to ${feature_name}.`,
        license_notes: SOURCE_SNAPSHOT.source_license,
        attribution_notes: SOURCE_SNAPSHOT.attribution_requirement,
      }),
      qualifiers: Object.freeze(qualifier ? [qualifier] : []),
      verification_status: factual_review,
      technical_validation: COUNTRY_FACT_STATUS.technical_validation,
      founder_approval: COUNTRY_FACT_STATUS.founder_approval,
      gameplay_approval: COUNTRY_FACT_STATUS.gameplay_approval,
      production_eligible: COUNTRY_FACT_STATUS.production_eligible,
      development_preview_only: COUNTRY_FACT_STATUS.development_preview_only,
      content_hash,
    });
  }),
);

export const COUNTRY_FACT_APPROVAL_MANIFEST = Object.freeze({
  schema_version: 1,
  catalog_id: "mapmaster-country-facts.v1",
  source_snapshot: SOURCE_SNAPSHOT.id,
  generated_from_raw_evidence: true,
  production_activation: "blocked_pending_per_claim_founder_approval_and_release_eligibility",
  records: COUNTRY_FACT_CATALOG.map(({ canonical_id, content_hash, founder_approval, gameplay_approval, production_eligible }) =>
    Object.freeze({ canonical_id, content_hash, founder_approval, gameplay_approval, production_eligible }),
  ),
});

export function countryFactForCanonicalId(canonicalId) {
  return COUNTRY_FACT_CATALOG.find((record) => record.canonical_id === canonicalId) || null;
}

export function validateCountryFactCatalog({ expectedDisplayNames, catalog = COUNTRY_FACT_CATALOG } = {}) {
  const errors = [];
  if (!Array.isArray(expectedDisplayNames) || expectedDisplayNames.length !== 194) {
    errors.push("Expected exactly 194 gameplay display identities for validation.");
  }
  if (catalog.length !== 194) errors.push(`Expected 194 catalog slots, found ${catalog.length}.`);
  const expectedIds = new Set((expectedDisplayNames || []).map(canonicalCountryId));
  const seenIds = new Set();
  const seenFacts = new Set();
  for (const record of catalog) {
    if (seenIds.has(record.canonical_id)) errors.push(`Duplicate canonical ID: ${record.canonical_id}`);
    seenIds.add(record.canonical_id);
    if (seenFacts.has(record.proposed_fact)) errors.push(`Duplicate fact text: ${record.canonical_id}`);
    seenFacts.add(record.proposed_fact);
    if (!expectedIds.has(record.canonical_id)) errors.push(`Unsupported canonical ID: ${record.canonical_id}`);
    const words = record.proposed_fact.trim().split(/\s+/).length;
    if (words < 15 || words > 35) errors.push(`Fact length outside 15–35 words: ${record.canonical_id} (${words}).`);
    if (!record.source.country_url || !record.source.feature_url || !record.source.specific_evidence) {
      errors.push(`Incomplete source provenance: ${record.canonical_id}`);
    }
    if (record.founder_approval !== "pending_founder_approval" || record.gameplay_approval !== "not_approved" || record.production_eligible !== false) {
      errors.push(`Candidate isolation status changed: ${record.canonical_id}`);
    }
  }
  for (const expectedId of expectedIds) if (!seenIds.has(expectedId)) errors.push(`Missing catalog slot: ${expectedId}`);
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), catalog_slots: catalog.length, canonical_ids: seenIds.size });
}
