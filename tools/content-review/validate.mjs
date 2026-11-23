import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { assertCandidateStatus, sha256, stableJson } from "./shared.mjs";
import { normalizeWikidataResponse } from "./wikidata.mjs";
import { normalizeGeoNamesResponses } from "./geonames.mjs";
import { normalizeOpenTdbBatches } from "./opentdb.mjs";

const SNAPSHOTS = [
  { source: "wikidata", raw: "raw/wikidata.v1.json", normalized: "normalized/wikidata.v1.json", selection: "selections/wikidata-countries.v1.json", hash: (raw) => raw.response, rebuild: (raw, selection) => normalizeWikidataResponse({ response: raw.response, selection, request_url: raw.request_url, retrieved_at: raw.retrieved_at }) },
  { source: "geonames", raw: "raw/geonames.v1.json", normalized: "normalized/geonames.v1.json", selection: "selections/geonames.v1.json", hash: (raw) => raw.requests.map(({ selection_id, response }) => ({ selection_id, response })), rebuild: (raw, selection) => normalizeGeoNamesResponses({ selection, responses: raw.requests.map(({ selection_id, response }) => ({ selection_id, response })), retrieved_at: raw.retrieved_at }) },
  { source: "opentdb", raw: "raw/opentdb-geography.v1.json", normalized: "normalized/opentdb-geography.v1.json", selection: "selections/opentdb-geography.v1.json", hash: (raw) => raw.batches, rebuild: (raw) => normalizeOpenTdbBatches({ batches: raw.batches, retrieved_at: raw.retrieved_at }) },
];

function increment(counts, key) {
  counts[key] = (counts[key] ?? 0) + 1;
}

export function summarizeRecords(records) {
  const technical_validation = { accepted: 0, pending_validation: 0, rejected: 0 };
  const human_content_approval = {};
  const gameplay_approval = {};
  const review_disposition = { accepted: 0, pending_review: 0, rejected: 0 };
  for (const record of records) {
    assertCandidateStatus(record);
    increment(technical_validation, record.technical_validation);
    increment(human_content_approval, record.human_content_approval);
    increment(gameplay_approval, record.gameplay_approval);
    increment(review_disposition, record.human_content_approval === "rejected" ? "rejected" : "pending_review");
  }
  return { technical_validation, human_content_approval, gameplay_approval, review_disposition };
}

function requireUnique(records, field, source) {
  const values = records.map((record) => record[field]).filter((value) => value !== null && value !== undefined);
  if (new Set(values).size !== values.length) throw new Error(`${source} has duplicate ${field} values`);
}

export async function validateCorpus(corpusRoot) {
  const manifest = JSON.parse(await readFile(resolve(corpusRoot, "manifest.json"), "utf8"));
  if (manifest.status !== "candidate_not_live" || manifest.runtime_import_allowed !== false || manifest.gameplay_approval !== "not_approved") {
    throw new Error("Corpus manifest is not candidate-only");
  }
  const recordsBySource = {};
  const source_integrity = {};
  const allRecords = [];
  for (const snapshot of SNAPSHOTS) {
    const raw = JSON.parse(await readFile(resolve(corpusRoot, snapshot.raw), "utf8"));
    const normalized = JSON.parse(await readFile(resolve(corpusRoot, snapshot.normalized), "utf8"));
    const selection = JSON.parse(await readFile(resolve(corpusRoot, snapshot.selection), "utf8"));
    if (normalized.source !== snapshot.source || raw.source !== snapshot.source) throw new Error(`Source mismatch for ${snapshot.source}`);
    if (normalized.raw_sha256 !== sha256(snapshot.hash(raw))) throw new Error(`Raw checksum mismatch for ${snapshot.source}`);
    if (stableJson(normalized) !== stableJson(snapshot.rebuild(raw, selection))) throw new Error(`Normalized snapshot does not match raw source evidence for ${snapshot.source}`);
    requireUnique(normalized.records, snapshot.source === "opentdb" ? "source_fingerprint" : "source_id", snapshot.source);
    const summary = summarizeRecords(normalized.records);
    recordsBySource[snapshot.source] = { records: normalized.records.length, ...summary };
    source_integrity[snapshot.source] = "valid";
    allRecords.push(...normalized.records);
  }
  const totals = summarizeRecords(allRecords);
  return {
    schema_version: 1,
    status: "candidate_not_live",
    source_integrity,
    records_by_source: recordsBySource,
    total_records: allRecords.length,
    ...totals,
    blockers: [
      "All records require human factual and geographic-policy review.",
      "No candidate record is approved for gameplay, CP04 scoring, CP05 maps, CP10 daily challenges, Firebase, cloud save, production build or service-worker caching.",
      "Source license/attribution evidence is recorded but is not legal clearance for production use.",
    ],
  };
}

export async function writeValidationReport(corpusRoot) {
  const report = await validateCorpus(corpusRoot);
  const path = resolve(corpusRoot, "reports/validation-report.json");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, stableJson(report));
  return { path, report };
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const { path, report } = await writeValidationReport(resolve(root, "candidate/content-review"));
  process.stdout.write(stableJson({ report: path, total_records: report.total_records, ...report.technical_validation, human_content_approval: report.human_content_approval, gameplay_approval: report.gameplay_approval }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
