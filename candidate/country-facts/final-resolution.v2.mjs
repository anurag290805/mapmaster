import { COUNTRY_FACT_CATALOG } from "./catalog.v1.mjs";
import { COUNTRY_FACT_INDEPENDENT_REVIEW } from "./independent-review.v1.mjs";
import {
  FACTBOOK_EDITORIAL_EVIDENCE_V2,
  factbookEditorialEvidenceForCountry,
} from "./snapshots/factbook-editorial-evidence.v2.mjs";

const RESOLVED_EDITORIAL_FACTS = new Map([
  [
    "Bahamas",
    "The Bahamas is made up of long, flat coral formations with some low rounded hills.",
  ],
  [
    "Burundi",
    "Burundi is hilly and mountainous, dropping to a plateau in the east, with some plains.",
  ],
  [
    "China",
    "China's west has mountains, high plateaus, and deserts, while plains, deltas, and hills characterize the east.",
  ],
  [
    "Congo",
    "Congo's terrain includes a coastal plain, southern and northern basins, and a central plateau.",
  ],
  ["Denmark", "Store Mollehoj is Denmark's highest point at 171 m."],
  ["Gambia", "The Gambia River's flood plain is flanked by some low hills."],
  [
    "Kiribati",
    "Kiribati consists mostly of low-lying coral atolls surrounded by extensive reefs.",
  ],
  [
    "Maldives",
    "The Maldives consists of flat coral atolls with white sandy beaches.",
  ],
  [
    "Marshall Islands",
    "The Marshall Islands are low coral limestone and sand islands.",
  ],
  [
    "Micronesia",
    "Micronesia's islands range from high mountainous islands to low coral atolls, with volcanic outcrops on Pohnpei, Kosrae, and Chuuk.",
  ],
  ["Tuvalu", "Tuvalu consists of low-lying, narrow coral atolls."],
]);

const EDITORIAL_HOLDS = new Set(["Benin", "Kuwait", "Senegal"]);

const PALESTINE_EVIDENCE = Object.freeze({
  snapshot_id: "pcbs-palestine-physical-geography.v1",
  source_organization: "Palestinian Central Bureau of Statistics (PCBS)",
  source_url: "https://www.pcbs.gov.ps/en/post-details/?postId=20309",
  retrieval_date: "2026-11-10",
  source_field: "PCBS World Environment Day statement, 2022-06-05",
  direct_evidence:
    "State of Palestine is characterized by a great variation in topography and climate.",
  source_evidence_hash:
    "sha256:98764bfde4f013e8e7d5a5be787b2332e47178e2e868450129d39f9cbb8faae6",
  license_notes:
    "PCBS publication; retain source URL and review any reuse terms before public presentation.",
  attribution_notes:
    "Retain PCBS attribution in the candidate evidence ledger.",
});

function stableContentHash(value) {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function factbookEvidence(record) {
  const source = factbookEditorialEvidenceForCountry(record.display_name);
  if (!source) return record.independent_evidence;
  return Object.freeze({
    snapshot_id: FACTBOOK_EDITORIAL_EVIDENCE_V2.id,
    source_organization: FACTBOOK_EDITORIAL_EVIDENCE_V2.upstream_organization,
    source_url: source.source_url,
    retrieval_date: FACTBOOK_EDITORIAL_EVIDENCE_V2.retrieved_at,
    source_code: source.source_code,
    source_path: source.source_path,
    source_field: source.source_field,
    direct_evidence: source.direct_evidence,
    source_evidence_hash: source.source_evidence_hash,
    license_notes: FACTBOOK_EDITORIAL_EVIDENCE_V2.source_license,
    attribution_notes: FACTBOOK_EDITORIAL_EVIDENCE_V2.attribution_requirement,
    temporal_note: FACTBOOK_EDITORIAL_EVIDENCE_V2.temporal_note,
  });
}

function finalRecord(record) {
  if (record.display_name === "Palestine") {
    const final_proposed_fact =
      "The State of Palestine is characterized by a great variation in topography and climate.";
    return Object.freeze({
      ...record,
      final_proposed_fact,
      independent_evidence: PALESTINE_EVIDENCE,
      factual_verification:
        "independently_supported_neutral_physical_geography",
      frozen_feature_comparison: "not_compared_no_scope_merge",
      policy_status: "policy_blocked_scope_and_entity_definition",
      editorial_quality: "neutral_fact_preserved_pending_policy_review",
      qualifications: Object.freeze([
        ...record.qualifications,
        "PCBS supports a neutral physical-geography statement for the existing canonical identity, but this resolution does not merge West Bank and Gaza profiles or resolve territorial scope.",
      ]),
      review_outcome: "NEEDS_REVIEW",
      content_hash: stableContentHash(
        [
          record.canonical_id,
          final_proposed_fact,
          PALESTINE_EVIDENCE.source_evidence_hash,
        ].join("\n"),
      ),
    });
  }

  const final_proposed_fact = RESOLVED_EDITORIAL_FACTS.get(record.display_name);
  if (!final_proposed_fact)
    return Object.freeze({
      ...record,
      policy_status:
        record.review_outcome === "NEEDS_REVIEW"
          ? "existing_policy_or_editorial_hold"
          : "not_policy_blocked",
    });

  const evidence = factbookEvidence(record);
  const gambia = record.display_name === "Gambia";
  return Object.freeze({
    ...record,
    final_proposed_fact,
    independent_evidence: evidence,
    factual_verification: "independently_corroborated_revised_fact",
    frozen_feature_comparison: gambia
      ? "not_comparable_different_claim_type"
      : record.frozen_feature_comparison,
    source_identity_status: gambia
      ? "corrected_mapmaster_name_to_factbook_gec_fips"
      : "source_identity_preserved",
    editorial_quality: "resolved_with_frozen_factbook_geography_field",
    qualifications: Object.freeze([
      ...record.qualifications.filter(
        (item) =>
          !item.includes("separately evidenced editorial rewrite") &&
          !item.includes("No single-country Factbook profile exists"),
      ),
      gambia
        ? "Corrected derived mapping: MapMaster's Gambia maps to Factbook's The Gambia (GEC/FIPS ga); the terrain field is a different claim type from the frozen P206 Atlantic Ocean statement."
        : "A stable physical-geography field from the already-pinned Factbook revision supplies this player-facing rewrite; the frozen Wikidata claim remains unchanged.",
    ]),
    review_outcome: "READY_FOR_FOUNDER_REVIEW",
    policy_status: "not_policy_blocked",
    content_hash: stableContentHash(
      [
        record.canonical_id,
        final_proposed_fact,
        evidence.source_evidence_hash,
      ].join("\n"),
    ),
  });
}

export const COUNTRY_FACT_FINAL_RESOLUTION_V2 = Object.freeze(
  COUNTRY_FACT_INDEPENDENT_REVIEW.map(finalRecord),
);

export const COUNTRY_FACT_FINAL_RESOLUTION_MANIFEST_V2 = Object.freeze({
  schema_version: 2,
  ledger_id: "mapmaster-country-facts-final-resolution.v2",
  baseline_catalog_id: "mapmaster-country-facts.v1",
  prior_overlay_id: "mapmaster-country-facts-independent-review.v1",
  candidate_only: true,
  founder_action: "required_per_claim",
  source_identity_correction:
    "Gambia -> The Gambia (Factbook GEC/FIPS ga); v1 snapshots are preserved.",
  records: COUNTRY_FACT_FINAL_RESOLUTION_V2.map(
    ({
      canonical_id,
      content_hash,
      factual_verification,
      review_outcome,
      founder_approval,
      gameplay_approval,
      production_eligible,
    }) =>
      Object.freeze({
        canonical_id,
        content_hash,
        factual_verification,
        review_outcome,
        founder_approval,
        gameplay_approval,
        production_eligible,
      }),
  ),
});

export function validateFinalResolutionV2({
  records = COUNTRY_FACT_FINAL_RESOLUTION_V2,
  expectedCatalog = COUNTRY_FACT_CATALOG,
} = {}) {
  const errors = [];
  const expected = new Set(
    expectedCatalog.map((record) => record.canonical_id),
  );
  const seen = new Set();
  if (records.length !== expectedCatalog.length)
    errors.push(
      `Expected ${expectedCatalog.length} review records, found ${records.length}.`,
    );
  for (const record of records) {
    if (seen.has(record.canonical_id))
      errors.push(`Duplicate canonical ID: ${record.canonical_id}`);
    seen.add(record.canonical_id);
    if (!expected.has(record.canonical_id))
      errors.push(`Unknown canonical ID: ${record.canonical_id}`);
    if (!record.source_snapshot_hash || !record.content_hash)
      errors.push(`Missing source or content hash: ${record.canonical_id}`);
    if (!record.independent_evidence?.direct_evidence)
      errors.push(
        `Missing independent direct evidence: ${record.canonical_id}`,
      );
    if (
      record.founder_approval !== "pending_founder_approval" ||
      record.gameplay_approval !== "not_approved" ||
      record.production_eligible !== false ||
      record.development_preview_only !== true
    ) {
      errors.push(`Candidate isolation status changed: ${record.canonical_id}`);
    }
  }
  const gambia = records.find(
    (record) => record.canonical_id === "mapmaster:country:gambia",
  );
  if (
    gambia?.independent_evidence?.source_code !== "ga" ||
    gambia?.independent_evidence?.source_path !== "africa/ga.json"
  )
    errors.push(
      "Gambia Factbook source identity is not corrected to GEC/FIPS ga.",
    );
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    reviewed_records: records.length,
    canonical_ids: seen.size,
  });
}

export const FINAL_RESOLUTION_V2_COUNTS = Object.freeze({
  ready_for_founder_review: COUNTRY_FACT_FINAL_RESOLUTION_V2.filter(
    (record) => record.review_outcome === "READY_FOR_FOUNDER_REVIEW",
  ).length,
  needs_review: COUNTRY_FACT_FINAL_RESOLUTION_V2.filter(
    (record) => record.review_outcome === "NEEDS_REVIEW",
  ).length,
  rejected: COUNTRY_FACT_FINAL_RESOLUTION_V2.filter(
    (record) => record.review_outcome === "REJECTED",
  ).length,
  editorial_holds: COUNTRY_FACT_FINAL_RESOLUTION_V2.filter((record) =>
    EDITORIAL_HOLDS.has(record.display_name),
  ).length,
  policy_holds: COUNTRY_FACT_FINAL_RESOLUTION_V2.filter(
    (record) =>
      record.policy_status === "policy_blocked_scope_and_entity_definition" ||
      record.qualifications.some((item) =>
        item.includes("CP05 and founder conservative geography policy"),
      ),
  ).length,
});
