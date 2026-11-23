import { COUNTRY_FACT_CATALOG } from "./catalog.v1.mjs";
import { FACTBOOK_ELEVATION_SNAPSHOT, factbookEvidenceForCountry } from "./snapshots/factbook-country-elevation.v1.mjs";

const POLICY_SENSITIVE_COUNTRIES = new Set([
  "Australia", "France", "Guyana", "India", "Israel", "Italy", "Kazakhstan", "Kyrgyzstan", "Montenegro", "Morocco", "Nepal", "Netherlands", "Nicaragua",
  "North Korea", "North Macedonia", "Pakistan", "Palestine", "Poland", "Rwanda", "Serbia", "South Africa", "Syria", "Taiwan", "Turkey", "Uganda",
]);

const EDITORIAL_REVIEW_COUNTRIES = new Set(["China", "Congo", "Denmark", "Gambia", "Maldives", "Marshall Islands", "Micronesia"]);
const SOURCE_TEXT_NEEDS_EDITORIAL_REVIEW = new Set(["Bahamas", "Benin", "Burundi", "Kiribati", "Kuwait", "Senegal", "Tuvalu"]);
const SHORT_EXPLICIT_MATCHES = new Set(["Pakistan"]);
const GENERIC_FEATURE_TOKENS = new Set(["mount", "mont", "mountain", "peak", "pico", "volcan", "volcano", "jabal", "jebel", "gora", "hill", "island", "islands", "point", "range", "massif", "main"]);

function stableContentHash(value) {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function normalized(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function evidenceNamesFeature(country, feature, evidence) {
  if (SHORT_EXPLICIT_MATCHES.has(country)) return true;
  const tokens = normalized(feature).split(" ").filter((token) => token.length >= 4 && !GENERIC_FEATURE_TOKENS.has(token));
  const direct = normalized(evidence || "");
  return tokens.some((token) => direct.includes(token));
}

function factualVerification(country, feature, evidence) {
  if (!evidence?.direct_evidence) return "needs_alternate_authoritative_source";
  return "independently_corroborated_revised_fact";
}

function finalFact(record, evidence, verification) {
  if (verification !== "independently_corroborated_revised_fact") return record.proposed_fact;
  const direct = evidence.direct_evidence.replace(/<br\s*\/?\s*>/gi, "; ");
  return `${record.display_name}'s independent country profile records its highest point as ${direct}.`;
}

function outcomeFor(country, verification) {
  if (verification !== "independently_corroborated_revised_fact") return "NEEDS_REVIEW";
  if (POLICY_SENSITIVE_COUNTRIES.has(country)) return "NEEDS_REVIEW";
  if (EDITORIAL_REVIEW_COUNTRIES.has(country) || SOURCE_TEXT_NEEDS_EDITORIAL_REVIEW.has(country)) return "NEEDS_REVIEW";
  return "READY_FOR_FOUNDER_REVIEW";
}

function qualificationFor(country, feature, verification, evidence) {
  const qualifications = [];
  if (verification === "needs_alternate_authoritative_source") qualifications.push("No single-country Factbook profile exists for this MapMaster identity; obtain a direct alternative source.");
  if (evidence?.direct_evidence && !evidenceNamesFeature(country, feature, evidence.direct_evidence)) qualifications.push("The independent highest-point field does not explicitly name a non-generic component of the frozen Wikidata feature. The final candidate uses the independent field; the frozen claim remains preserved and unresolved as a comparison.");
  if (POLICY_SENSITIVE_COUNTRIES.has(country)) qualifications.push("Existing CP05 and founder conservative geography policy require a neutral, non-competitive treatment until scope is individually cleared.");
  if (EDITORIAL_REVIEW_COUNTRIES.has(country) || SOURCE_TEXT_NEEDS_EDITORIAL_REVIEW.has(country)) qualifications.push("This entry requires a separately evidenced editorial rewrite before it can be proposed as a high-quality player-facing learning fact.");
  if (evidence?.direct_evidence) qualifications.push(`Independent profile field: ${evidence.direct_evidence}`);
  return Object.freeze(qualifications);
}

export const COUNTRY_FACT_INDEPENDENT_REVIEW = Object.freeze(COUNTRY_FACT_CATALOG.map((record) => {
  const evidence = factbookEvidenceForCountry(record.display_name);
  const frozen_feature = record.source.feature_entity_id ? record.proposed_fact.split(" is listed")[0] : record.display_name;
  const factual_verification = factualVerification(record.display_name, frozen_feature, evidence);
  const final_proposed_fact = finalFact(record, evidence, factual_verification);
  const review_outcome = outcomeFor(record.display_name, factual_verification);
  return Object.freeze({
    canonical_id: record.canonical_id,
    display_name: record.display_name,
    source_snapshot_hash: record.content_hash,
    frozen_source: record.source,
    frozen_qualifiers: record.qualifiers,
    final_proposed_fact,
    independent_evidence: Object.freeze({
      snapshot_id: FACTBOOK_ELEVATION_SNAPSHOT.id,
      source_organization: FACTBOOK_ELEVATION_SNAPSHOT.upstream_organization,
      source_url: evidence?.source_url || null,
      retrieval_date: FACTBOOK_ELEVATION_SNAPSHOT.retrieved_at,
      direct_evidence: evidence?.direct_evidence || null,
      source_evidence_hash: evidence?.source_evidence_hash || null,
      license_notes: FACTBOOK_ELEVATION_SNAPSHOT.source_license,
      attribution_notes: FACTBOOK_ELEVATION_SNAPSHOT.attribution_requirement,
    }),
    factual_verification,
    frozen_feature_comparison: evidence?.direct_evidence
      ? (evidenceNamesFeature(record.display_name, frozen_feature, evidence.direct_evidence) ? "independent_field_names_frozen_feature" : "independent_field_differs_or_uses_unmapped_name")
      : "no_independent_profile_to_compare",
    editorial_quality: (EDITORIAL_REVIEW_COUNTRIES.has(record.display_name) || SOURCE_TEXT_NEEDS_EDITORIAL_REVIEW.has(record.display_name)) ? "needs_editorial_review" : "source-supported-high-point-learning-fact",
    qualifications: qualificationFor(record.display_name, frozen_feature, factual_verification, evidence),
    review_outcome,
    technical_validation: record.technical_validation,
    founder_approval: "pending_founder_approval",
    gameplay_approval: "not_approved",
    production_eligible: false,
    development_preview_only: true,
    content_hash: stableContentHash([record.canonical_id, final_proposed_fact, factual_verification, evidence?.source_evidence_hash || ""].join("\n")),
  });
}));

export const COUNTRY_FACT_INDEPENDENT_REVIEW_MANIFEST = Object.freeze({
  schema_version: 1,
  ledger_id: "mapmaster-country-facts-independent-review.v1",
  baseline_catalog_id: "mapmaster-country-facts.v1",
  independent_snapshot: FACTBOOK_ELEVATION_SNAPSHOT.id,
  candidate_only: true,
  founder_action: "required_per_claim",
  records: COUNTRY_FACT_INDEPENDENT_REVIEW.map(({ canonical_id, content_hash, factual_verification, review_outcome, founder_approval, gameplay_approval, production_eligible }) =>
    Object.freeze({ canonical_id, content_hash, factual_verification, review_outcome, founder_approval, gameplay_approval, production_eligible }),
  ),
});

export function validateIndependentReviewLedger({ records = COUNTRY_FACT_INDEPENDENT_REVIEW, expectedCatalog = COUNTRY_FACT_CATALOG } = {}) {
  const errors = [];
  if (records.length !== expectedCatalog.length) errors.push(`Expected ${expectedCatalog.length} review records, found ${records.length}.`);
  const expected = new Set(expectedCatalog.map((record) => record.canonical_id));
  const seen = new Set();
  for (const record of records) {
    if (seen.has(record.canonical_id)) errors.push(`Duplicate canonical ID: ${record.canonical_id}`);
    seen.add(record.canonical_id);
    if (!expected.has(record.canonical_id)) errors.push(`Unknown canonical ID: ${record.canonical_id}`);
    if (!record.source_snapshot_hash) errors.push(`Missing frozen source hash: ${record.canonical_id}`);
    if (record.factual_verification === "independently_corroborated_revised_fact" && !record.independent_evidence?.direct_evidence) {
      errors.push(`Missing independent direct evidence: ${record.canonical_id}`);
    }
    if (!record.independent_evidence?.direct_evidence && record.factual_verification !== "needs_alternate_authoritative_source") {
      errors.push(`Missing independent direct evidence: ${record.canonical_id}`);
    }
    if (record.founder_approval !== "pending_founder_approval" || record.gameplay_approval !== "not_approved" || record.production_eligible !== false || record.development_preview_only !== true) {
      errors.push(`Candidate isolation status changed: ${record.canonical_id}`);
    }
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), reviewed_records: records.length, canonical_ids: seen.size });
}
