import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createReviewStatus, sha256, stableJson } from "./shared.mjs";

const ENDPOINT = "https://secure.geonames.org/getJSON";

function normalizedName(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase();
}

export function buildGeoNamesUrl(geonameId, username) {
  if (!Number.isInteger(geonameId) || geonameId <= 0) throw new Error("GeoNames ID must be a positive integer");
  if (!username) throw new Error("GeoNames username is required for a fetch");
  return `${ENDPOINT}?geonameId=${geonameId}&username=${encodeURIComponent(username)}`;
}

function assertUniqueSelection(selection) {
  const ids = selection.records.map((record) => record.geoname_id);
  if (new Set(ids).size !== ids.length) throw new Error("GeoNames selection contains duplicate IDs");
}

function normalizeRecord(selectionRecord, response, retrievedAt) {
  const errors = [];
  const flags = [];
  const latitude = response?.lat === "" || response?.lat === null || response?.lat === undefined ? Number.NaN : Number(response.lat);
  const longitude = response?.lng === "" || response?.lng === null || response?.lng === undefined ? Number.NaN : Number(response.lng);
  if (!response || Number(response.geonameId) !== selectionRecord.geoname_id) errors.push("source_id_mismatch");
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) errors.push("coordinate_out_of_bounds");
  if (response?.fcl !== selectionRecord.expected_fcl) errors.push("feature_class_mismatch");
  if (response?.fcode !== selectionRecord.expected_fcode) errors.push("feature_code_mismatch");
  if (normalizedName(response?.name) !== normalizedName(selectionRecord.name)) flags.push("source_name_mismatch");
  if (selectionRecord.expected_country_code && response?.countryCode !== selectionRecord.expected_country_code) flags.push("source_country_mismatch");
  return {
    source_id: selectionRecord.geoname_id,
    source_name: "GeoNames",
    source_url: `https://www.geonames.org/${selectionRecord.geoname_id}/`,
    retrieved_at: retrievedAt,
    selection: selectionRecord,
    coordinates: { latitude, longitude },
    source: response
      ? {
          geoname_id: response.geonameId,
          name: response.name,
          toponym_name: response.toponymName,
          alternate_names: response.alternateNames ?? [],
          feature_class: response.fcl,
          feature_code: response.fcode,
          country_code: response.countryCode ?? null,
        }
      : null,
    ...createReviewStatus(errors.length ? "rejected" : "accepted"),
    validation_errors: errors,
    review_flags: flags,
  };
}

export function normalizeGeoNamesResponses({ selection, responses, retrieved_at }) {
  assertUniqueSelection(selection);
  const indexed = new Map(responses.map((entry) => [entry.selection_id, entry.response]));
  const records = selection.records.map((record) => normalizeRecord(record, indexed.get(record.geoname_id), retrieved_at));
  return {
    schema_version: 1,
    source: "geonames",
    source_license: "CC-BY-4.0",
    attribution: "GeoNames, CC BY 4.0 — https://www.geonames.org/",
    retrieved_at,
    raw_sha256: sha256(responses),
    records,
  };
}

export async function fetchGeoNamesSnapshot({ selection, username, fetchImpl = fetch, retrievedAt = new Date().toISOString(), retryDelay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds)) }) {
  assertUniqueSelection(selection);
  const responses = [];
  for (const record of selection.records) {
    const requestUrl = buildGeoNamesUrl(record.geoname_id, username);
    let response;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetchImpl(requestUrl, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`GeoNames request failed for ${record.geoname_id}: ${response.status}`);
        break;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await retryDelay(500 * (attempt + 1));
      }
    }
    if (!response) throw lastError;
    responses.push({ selection_id: record.geoname_id, response: await response.json() });
  }
  const raw = {
    schema_version: 1,
    source: "geonames",
    source_license: "CC-BY-4.0",
    attribution: "GeoNames, CC BY 4.0 — https://www.geonames.org/",
    retrieved_at: retrievedAt,
    requests: responses.map((entry) => ({
      selection_id: entry.selection_id,
      request_url: `${ENDPOINT}?geonameId=${entry.selection_id}`,
      response: entry.response,
    })),
  };
  return { raw, normalized: normalizeGeoNamesResponses({ selection, responses, retrieved_at: retrievedAt }) };
}

export async function writeGeoNamesSnapshot(snapshot, outputRoot) {
  const rawPath = resolve(outputRoot, "raw/geonames.v1.json");
  const normalizedPath = resolve(outputRoot, "normalized/geonames.v1.json");
  await mkdir(dirname(rawPath), { recursive: true });
  await mkdir(dirname(normalizedPath), { recursive: true });
  await writeFile(rawPath, stableJson(snapshot.raw));
  await writeFile(normalizedPath, stableJson(snapshot.normalized));
  return { rawPath, normalizedPath };
}

async function main() {
  const username = process.env.GEONAMES_USERNAME;
  if (!username) throw new Error("Set GEONAMES_USERNAME for the one-time development snapshot fetch");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const selection = JSON.parse(await readFile(resolve(root, "candidate/content-review/selections/geonames.v1.json"), "utf8"));
  const snapshot = await fetchGeoNamesSnapshot({ selection, username });
  const paths = await writeGeoNamesSnapshot(snapshot, resolve(root, "candidate/content-review"));
  process.stdout.write(stableJson({ records: snapshot.normalized.records.length, ...paths }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
