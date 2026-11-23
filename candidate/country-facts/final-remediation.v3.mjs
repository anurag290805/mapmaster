import { COUNTRY_FACT_CATALOG } from "./catalog.v1.mjs";
import {
  COUNTRY_FACT_FINAL_RESOLUTION_V2,
  COUNTRY_FACT_FINAL_RESOLUTION_MANIFEST_V2,
} from "./final-resolution.v2.mjs";

const HIGH_PRIORITY_REVIEW = new Map([
  [
    "Antigua and Barbuda",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "On Antigua, Mount Obama—also called Boggy Peak—rises to 402 m.",
      source_organization:
        "Government of Antigua and Barbuda; UNFCCC national communication",
      source_url:
        "https://ab.gov.ag/detail_template.php?page=aboutAB%2Fantigua_about",
      corroborating_url: "https://unfccc.int/resource/docs/natc/antnc2.pdf",
      direct_evidence:
        "Government source names Boggy Peak as Antigua's 1,319-foot high point; the national communication identifies Mt. Obama at 1,319 ft (402 m).",
      status: "externally_reverified_name_and_scope",
    },
  ],
  [
    "Bangladesh",
    {
      outcome: "NEEDS_REVIEW",
      source_organization: "Survey of Bangladesh / Ministry of Defense",
      source_url:
        "https://www.dhakatribune.com/bangladesh/406955/survey-to-determine-highest-mountain-peak-begins%C2%A0",
      direct_evidence:
        "The 2026 Survey of Bangladesh campaign was initiated to resolve the competing highest-peak claims using GNSS methods; no final official result was located in this review.",
      status: "held_pending_official_2026_survey_result",
    },
  ],
  [
    "Botswana",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "A 2025 GNSS survey identified Monalanong Hill, about 1,494 m high, as Botswana's highest hill.",
      source_organization:
        "Botswana National Ecosystem Assessment; GNSS survey research",
      source_url:
        "https://www.ecosystemassessments.net/content/uploads/2026/05/BW-NEA-2025-FINAL-TECHNICAL-REPORT-5-high-compression.pdf",
      corroborating_url: "https://arxiv.org/abs/2511.12332",
      direct_evidence:
        "The Botswana assessment identifies Manyelanong as the highest point at 1,494 m; the GNSS study concludes Monalanong Hill is Botswana's highest hill.",
      status: "externally_reverified_2025_gnss",
    },
  ],
  [
    "Colombia",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "A 2024 field survey measured Pico Simón Bolívar slightly higher than nearby Pico Cristóbal Colón.",
      source_organization: "American Alpine Club / 2024 field survey",
      source_url:
        "https://publications.americanalpineclub.org/articles/13201217166",
      corroborating_url: "https://arxiv.org/abs/2512.14978",
      direct_evidence:
        "The 2024 measurements reported Pico Simón Bolívar at 5,720.42 m and Pico Cristóbal Colón at 5,712.79 m; the claim is dated to the survey rather than presented as a permanent elevation.",
      status: "externally_reverified_2024_survey",
    },
  ],
  [
    "Guinea-Bissau",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "A 2025 ground survey identified Mount Ronde as Guinea-Bissau's high point.",
      source_organization: "Progress in Physical Geography ground-survey study",
      source_url:
        "https://journals.sagepub.com/doi/pdf/10.1177/03091333251401102",
      direct_evidence:
        "The study reports Mount Ronde as the newly determined Guinea-Bissau national highpoint after 2018–2025 ground surveys.",
      status: "externally_reverified_2025_ground_survey",
    },
  ],
  [
    "Luxembourg",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "Kneiff, in Wilwerdange, is Luxembourg's highest point at 560 m.",
      source_organization: "Government of Luxembourg / STATEC",
      source_url:
        "https://luxembourg.public.lu/en/society-and-culture/territoire-et-climat/territoire.html",
      corroborating_url:
        "https://unfccc.int/sites/default/files/resource/LU-NID_2025_FINAL_250415.pdf",
      direct_evidence:
        "Government sources identify the 560 m high point in Wilwerdange as Kneiff; the older Buurgplaatz value is not reused.",
      status: "externally_reverified_official_topography",
    },
  ],
  [
    "Mauritius",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "Piton de la Rivière Noire rises to 828 m in Mauritius's Black River Gorges National Park.",
      source_organization: "Mauritius National Parks and Conservation Service",
      source_url:
        "https://npcs.govmu.org/Pages/National%20Parks/Black-River-Gorges-National-Parks.aspx",
      direct_evidence:
        "The National Parks and Conservation Service identifies Piton de la Rivière Noire as the 828 m highest point within Black River Gorges National Park.",
      status: "externally_reverified_official_topography",
    },
  ],
  [
    "Myanmar",
    {
      outcome: "NEEDS_REVIEW",
      source_organization: "National Geographic / mountain-survey reporting",
      source_url:
        "https://www.nationalgeographic.com/adventure/article/150116-burma-climb-myanmar-hkakabo-razi-1",
      corroborating_url:
        "https://thediplomat.com/2025/06/who-will-climb-hkakabo-razi/",
      direct_evidence:
        "Gamlang Razi has a precise 2013 GPS measurement, while Hkakabo Razi remains traditionally recognised but lacks a modern summit measurement; the highest-point question is unresolved.",
      status: "held_unresolved_competing_summits",
    },
  ],
  [
    "Saudi Arabia",
    {
      outcome: "NEEDS_REVIEW",
      source_organization: "Progress in Physical Geography ground-survey study",
      source_url:
        "https://journals.sagepub.com/doi/pdf/10.1177/03091333251401102",
      direct_evidence:
        "The 2018–2025 survey study identifies Jabal Ferwa, while legacy references identify Jabal Sawda; no current Saudi surveying authority resolution was located.",
      status: "held_conflicting_survey_and_legacy_reference",
    },
  ],
  [
    "Sweden",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "Kebnekaise's ice-free North Peak is Sweden's highest point at 2,096.8 m; the glacier-covered South Peak changes height.",
      source_organization: "Stockholm University Tarfala Research Station",
      source_url:
        "https://www.humangeo.su.se/english/news/articles/2024-09-20-heavy-melting-on-kebnekaises-southern-peak",
      direct_evidence:
        "Stockholm University measured South Peak at 2,089.9 m in September 2024, 6.9 m below North Peak, which is 2,096.8 m.",
      status: "externally_reverified_2024_measurement",
    },
  ],
  [
    "Togo",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "A 2025 ground survey identified Mount Atilakoutse as Togo's high point.",
      source_organization: "Progress in Physical Geography ground-survey study",
      source_url:
        "https://journals.sagepub.com/doi/pdf/10.1177/03091333251401102",
      direct_evidence:
        "The study reports Mount Atilakoutse as the newly determined Togo national highpoint after 2018–2025 ground surveys.",
      status: "externally_reverified_2025_ground_survey",
    },
  ],
  [
    "Uzbekistan",
    {
      outcome: "READY_FOR_FOUNDER_REVIEW",
      final_proposed_fact:
        "A 2023 survey found Alpomish higher than the 4,643 m peak often mislabeled Khazret Sultan.",
      source_organization:
        "American Alpine Club / Progress in Physical Geography",
      source_url:
        "https://publications.americanalpineclub.org/articles/13201216908",
      corroborating_url:
        "https://journals.sagepub.com/doi/pdf/10.1177/03091333251401102",
      direct_evidence:
        "Six 2023 measurements found Alpomish higher than Peak 4643; the published study notes that Peak 4643 is often incorrectly called Khazret Sultan.",
      status: "externally_reverified_2023_survey",
    },
  ],
  [
    "Zambia",
    {
      outcome: "NEEDS_REVIEW",
      source_organization: "Zambian local-government planning evidence",
      source_url:
        "https://www.lavushimandacouncil.gov.zm/wp-content/uploads/2024/09/Muchinga-Province-Summarized-IDPs-Booklet_August-13.pdf",
      direct_evidence:
        "Available government planning material describes the highest point as 2,329 m, while the frozen source names Mafinga Central at 2,330 m; a national topographic source was not located to settle the name and exact height.",
      status: "held_name_and_elevation_discrepancy",
    },
  ],
]);

const V5_REWRITES = new Map([
  [
    "Bahamas",
    "Low rounded hills rise from the Bahamas' long, flat coral formations.",
  ],
  [
    "Burundi",
    "Burundi's hilly, mountainous terrain drops eastward to a plateau and some plains.",
  ],
  [
    "Congo",
    "Congo's terrain steps from a coastal plain through southern and northern basins to a central plateau.",
  ],
  ["Denmark", "Store Mollehoj is Denmark's highest point, at 171 m."],
  [
    "Gambia",
    "The Gambia River runs through a flood plain flanked by low hills.",
  ],
  [
    "Kiribati",
    "Extensive reefs surround Kiribati's mostly low-lying coral atolls.",
  ],
  ["Maldives", "White sandy beaches edge the Maldives' flat coral atolls."],
  [
    "Marshall Islands",
    "Low coral limestone and sand form the Marshall Islands.",
  ],
  ["Tuvalu", "Tuvalu is made up of low-lying, narrow coral atolls."],
]);

const PRESERVED_V5_RECOMMENDATIONS = new Set(["China", "Micronesia"]);
const INITIAL_HOLD_IDS = new Set(
  COUNTRY_FACT_FINAL_RESOLUTION_V2.filter(
    (record) => record.review_outcome === "NEEDS_REVIEW",
  ).map((record) => record.canonical_id),
);

function stableContentHash(value) {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a32:${hash.toString(16).padStart(8, "0")}`;
}

function cleanEvidence(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, "; ")
    .replace(/\s+/g, " ")
    .trim();
}

function addMissingMetres(value) {
  if (/\b\d[\d,]*\s*(?:m|met(?:er|re)s?)\b/i.test(value)) return value;
  return value.replace(/(\d[\d,]*)([.!]?)$/, "$1 m$2");
}

function naturalHighestPointFact(record) {
  const evidence = addMissingMetres(
    cleanEvidence(record.independent_evidence.direct_evidence),
  );
  const variants = [
    `${record.display_name}'s highest point is ${evidence}.`,
    `The highest point in ${record.display_name} is ${evidence}.`,
    `${evidence} is recorded as the highest point in ${record.display_name}.`,
  ];
  const seed = [...record.canonical_id].reduce(
    (total, character) => total + character.codePointAt(0),
    0,
  );
  return variants[seed % variants.length].replace(/\.\./g, ".");
}

function externalEvidence(record, finding) {
  return Object.freeze({
    snapshot_id: "country-facts-priority-research.v3",
    source_organization: finding.source_organization,
    source_url: finding.source_url,
    corroborating_url: finding.corroborating_url || null,
    retrieval_date: "2026-11-10",
    source_field: "Current authoritative or scientific geographic finding",
    direct_evidence: finding.direct_evidence,
    source_evidence_hash: stableContentHash(
      [finding.source_url, finding.direct_evidence].join("\n"),
    ),
    license_notes:
      "Retain the linked source and assess its reuse terms before public presentation.",
    attribution_notes:
      "Retain source title, URL, retrieval date, and research qualification in the founder checklist.",
  });
}

function remediationRecord(record) {
  const priority = HIGH_PRIORITY_REVIEW.get(record.display_name);
  if (priority) {
    const final_proposed_fact =
      priority.final_proposed_fact || record.final_proposed_fact;
    return Object.freeze({
      ...record,
      final_proposed_fact,
      independent_evidence: externalEvidence(record, priority),
      factual_verification:
        priority.outcome === "READY_FOR_FOUNDER_REVIEW"
          ? "externally_reverified_current_geography"
          : "needs_current_authoritative_resolution",
      editorial_recommendation:
        priority.outcome === "READY_FOR_FOUNDER_REVIEW"
          ? "recommended_pending_founder"
          : "not_recommended_pending_evidence",
      high_priority_status: priority.status,
      qualifications: Object.freeze([
        ...record.qualifications,
        priority.outcome === "READY_FOR_FOUNDER_REVIEW"
          ? "Current authoritative/scientific evidence supersedes this candidate wording only; frozen v1/v2 source claims remain preserved."
          : "This previously ready candidate is explicitly held by the final remediation because current evidence is incomplete or conflicts; it is not eligible for founder approval.",
      ]),
      review_outcome: priority.outcome,
      content_hash: stableContentHash(
        [
          record.canonical_id,
          final_proposed_fact,
          priority.source_url,
          priority.direct_evidence,
        ].join("\n"),
      ),
    });
  }

  if (INITIAL_HOLD_IDS.has(record.canonical_id)) {
    return Object.freeze({
      ...record,
      editorial_recommendation: "not_recommended_existing_hold",
      high_priority_status: "not_applicable_existing_hold_preserved",
    });
  }

  if (PRESERVED_V5_RECOMMENDATIONS.has(record.display_name)) {
    return Object.freeze({
      ...record,
      editorial_recommendation: "recommended_unchanged_v5_review",
      high_priority_status: "not_applicable",
    });
  }

  const final_proposed_fact =
    V5_REWRITES.get(record.display_name) || naturalHighestPointFact(record);
  return Object.freeze({
    ...record,
    final_proposed_fact,
    editorial_recommendation: "recommended_pending_founder",
    high_priority_status: "not_applicable",
    editorial_quality: V5_REWRITES.has(record.display_name)
      ? "rewritten_v5_player_facing"
      : "rewritten_v4_natural_player_facing",
    qualifications: Object.freeze([
      ...record.qualifications,
      "Player-facing wording was editorially rewritten from the exact pre-existing evidence field; source evidence and approval states are unchanged.",
    ]),
    content_hash: stableContentHash(
      [
        record.canonical_id,
        final_proposed_fact,
        record.independent_evidence.source_evidence_hash,
      ].join("\n"),
    ),
  });
}

export const COUNTRY_FACT_FINAL_REMEDIATION_V3 = Object.freeze(
  COUNTRY_FACT_FINAL_RESOLUTION_V2.map(remediationRecord),
);

export const COUNTRY_FACT_FINAL_REMEDIATION_MANIFEST_V3 = Object.freeze({
  schema_version: 3,
  ledger_id: "mapmaster-country-facts-final-remediation.v3",
  baseline_catalog_id: "mapmaster-country-facts.v1",
  prior_overlay_id: COUNTRY_FACT_FINAL_RESOLUTION_MANIFEST_V2.ledger_id,
  candidate_only: true,
  founder_action: "required_per_claim",
  records: COUNTRY_FACT_FINAL_REMEDIATION_V3.map(
    ({
      canonical_id,
      content_hash,
      factual_verification,
      editorial_recommendation,
      review_outcome,
      founder_approval,
      gameplay_approval,
      production_eligible,
    }) =>
      Object.freeze({
        canonical_id,
        content_hash,
        factual_verification,
        editorial_recommendation,
        review_outcome,
        founder_approval,
        gameplay_approval,
        production_eligible,
      }),
  ),
});

export function validateFinalRemediationV3({
  records = COUNTRY_FACT_FINAL_REMEDIATION_V3,
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
    if (
      !record.source_snapshot_hash ||
      !record.content_hash ||
      !record.independent_evidence?.source_url ||
      !record.independent_evidence?.direct_evidence
    )
      errors.push(`Missing review evidence: ${record.canonical_id}`);
    if (
      record.founder_approval !== "pending_founder_approval" ||
      record.gameplay_approval !== "not_approved" ||
      record.production_eligible !== false ||
      record.development_preview_only !== true
    )
      errors.push(`Candidate isolation status changed: ${record.canonical_id}`);
  }
  for (const previousHold of INITIAL_HOLD_IDS) {
    if (
      records.find((record) => record.canonical_id === previousHold)
        ?.review_outcome !== "NEEDS_REVIEW"
    )
      errors.push(`Existing hold was promoted: ${previousHold}`);
  }
  for (const name of ["Bangladesh", "Myanmar", "Saudi Arabia", "Zambia"]) {
    if (
      records.find((record) => record.display_name === name)?.review_outcome !==
      "NEEDS_REVIEW"
    )
      errors.push(`High-priority hold was not retained: ${name}`);
  }
  const ecuador = records.find((record) => record.display_name === "Ecuador");
  const greece = records.find((record) => record.display_name === "Greece");
  if (!/6,267 m\./.test(ecuador?.final_proposed_fact || ""))
    errors.push("Ecuador is missing metres in final wording.");
  if (!/2,917 m\./.test(greece?.final_proposed_fact || ""))
    errors.push("Greece is missing metres in final wording.");
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    reviewed_records: records.length,
    canonical_ids: seen.size,
  });
}

export const FINAL_REMEDIATION_V3_COUNTS = Object.freeze({
  independently_verified: COUNTRY_FACT_FINAL_REMEDIATION_V3.filter(
    (record) => record.review_outcome === "READY_FOR_FOUNDER_REVIEW",
  ).length,
  editorially_recommended: COUNTRY_FACT_FINAL_REMEDIATION_V3.filter((record) =>
    record.editorial_recommendation?.startsWith("recommended_"),
  ).length,
  needs_review: COUNTRY_FACT_FINAL_REMEDIATION_V3.filter(
    (record) => record.review_outcome === "NEEDS_REVIEW",
  ).length,
  founder_approved: COUNTRY_FACT_FINAL_REMEDIATION_V3.filter(
    (record) => record.founder_approval === "approved",
  ).length,
  production_eligible: COUNTRY_FACT_FINAL_REMEDIATION_V3.filter(
    (record) => record.production_eligible,
  ).length,
});
