import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createReviewStatus, sha256, stableJson } from "./shared.mjs";

const ENTITY_PREFIX = "http://www.wikidata.org/entity/";
const QUALIFIER_PREFIX = "http://www.wikidata.org/prop/qualifier/";
const CORE_PROPERTIES = new Set(["P36", "P37", "P38"]);

function idFromUri(uri) {
  return uri?.startsWith(ENTITY_PREFIX) ? uri.slice(ENTITY_PREFIX.length) : null;
}

function sourceTerm(binding, label) {
  if (!binding) return null;
  return {
    ...(idFromUri(binding.value) ? { id: idFromUri(binding.value) } : {}),
    type: binding.type,
    value: binding.value,
    ...(binding.datatype ? { datatype: binding.datatype } : {}),
    ...(binding["xml:lang"] ? { language: binding["xml:lang"] } : {}),
    ...(label?.value ? { label: label.value } : {}),
  };
}

function propertyId(binding) {
  return idFromUri(binding?.value);
}

export function buildCountryQuery(selection) {
  const qids = [...new Set(selection.countries.map((country) => country.qid))].sort();
  const properties = [...new Set(selection.properties)].sort();
  if (!qids.length || !properties.length) throw new Error("Country selection requires QIDs and properties");
  if (qids.some((qid) => !/^Q\d+$/.test(qid))) throw new Error("Country selection has an invalid QID");
  if (properties.some((property) => !/^P\d+$/.test(property))) throw new Error("Country selection has an invalid property");
  return `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?country ?countryLabel ?property ?statement ?value ?valueLabel ?qualifierProperty ?qualifierValue WHERE {
  VALUES ?country { ${qids.map((qid) => `wd:${qid}`).join(" ")} }
  VALUES ?property { ${properties.map((property) => `wd:${property}`).join(" ")} }
  BIND(IRI(REPLACE(STR(?property), "entity/", "prop/")) AS ?claimProperty)
  BIND(IRI(REPLACE(STR(?property), "entity/", "prop/statement/")) AS ?statementProperty)
  ?country ?claimProperty ?statement .
  ?statement ?statementProperty ?value .
  OPTIONAL { ?country rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en") }
  OPTIONAL { ?value rdfs:label ?valueLabel . FILTER(LANG(?valueLabel) = "en") }
  OPTIONAL {
    ?statement ?qualifierProperty ?qualifierValue .
    FILTER(STRSTARTS(STR(?qualifierProperty), "${QUALIFIER_PREFIX}"))
    FILTER(!STRSTARTS(STR(?qualifierProperty), "${QUALIFIER_PREFIX}value/"))
  }
}
ORDER BY ?country ?property ?statement ?qualifierProperty ?qualifierValue`;
}

function normalizeBinding(binding) {
  const qid = idFromUri(binding.country?.value);
  const property = propertyId(binding.property);
  const statement = binding.statement?.value;
  if (!qid || !property || !statement || !binding.value) return null;
  const qualifierProperty = binding.qualifierProperty?.value?.startsWith(QUALIFIER_PREFIX) && !binding.qualifierProperty.value.startsWith(`${QUALIFIER_PREFIX}value/`)
    ? binding.qualifierProperty.value.slice(QUALIFIER_PREFIX.length)
    : null;
  return {
    qid,
    property,
    statement,
    country_label: binding.countryLabel?.value ?? null,
    value: sourceTerm(binding.value, binding.valueLabel),
    qualifier: qualifierProperty && binding.qualifierValue
      ? {
          property: qualifierProperty,
          value: binding.qualifierValue.value,
          value_type: binding.qualifierValue.type,
          ...(binding.qualifierValue.datatype ? { datatype: binding.qualifierValue.datatype } : {}),
          ...(binding.qualifierValue["xml:lang"] ? { language: binding.qualifierValue["xml:lang"] } : {}),
        }
      : null,
  };
}

export function normalizeWikidataResponse({ response, selection, request_url, retrieved_at }) {
  const selected = new Map(selection.countries.map((country) => [country.qid, country]));
  const byCountry = new Map(
    selection.countries.map((country) => [country.qid, {
      source_id: country.qid,
      source_name: "Wikidata",
      source_url: request_url,
      retrieved_at,
      selection: { name: country.name, region: country.region },
      label: null,
      claims: Object.fromEntries(selection.properties.map((property) => [property, []])),
    }]),
  );
  for (const rawBinding of response?.results?.bindings ?? []) {
    const binding = normalizeBinding(rawBinding);
    if (!binding || !selected.has(binding.qid) || !byCountry.get(binding.qid).claims[binding.property]) continue;
    const record = byCountry.get(binding.qid);
    record.label ??= binding.country_label;
    let claim = record.claims[binding.property].find((item) => item.statement_id === binding.statement);
    if (!claim) {
      claim = { statement_id: binding.statement, value: binding.value, qualifiers: [] };
      record.claims[binding.property].push(claim);
    }
    if (binding.qualifier && !claim.qualifiers.some((item) => stableJson(item) === stableJson(binding.qualifier))) {
      claim.qualifiers.push(binding.qualifier);
    }
  }
  const records = selection.countries.map((country) => {
    const record = byCountry.get(country.qid);
    const review_flags = [];
    for (const property of selection.properties) {
      if (CORE_PROPERTIES.has(property) && record.claims[property].length === 0) review_flags.push(`missing_core_property:${property}`);
      if (record.claims[property].length > 1) review_flags.push(`multiple_claims:${property}`);
    }
    return {
      ...record,
      ...createReviewStatus("accepted"),
      review_flags,
    };
  });
  return {
    schema_version: 1,
    source: "wikidata",
    source_license: "CC0-1.0",
    request_url,
    retrieved_at,
    raw_sha256: sha256(response),
    records,
  };
}

export async function fetchWikidataSnapshot({ selection, fetchImpl = fetch, retrievedAt = new Date().toISOString(), endpoint = "https://query.wikidata.org/sparql" }) {
  const query = buildCountryQuery(selection);
  const request_url = `${endpoint}?format=json&query=${encodeURIComponent(query)}`;
  const response = await fetchImpl(request_url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "MapMaster-content-review/1.0 (development-only candidate corpus)",
    },
  });
  if (!response.ok) throw new Error(`Wikidata request failed: ${response.status}`);
  const raw_response = await response.json();
  return {
    raw: {
      schema_version: 1,
      source: "wikidata",
      source_license: "CC0-1.0",
      request_url,
      retrieved_at: retrievedAt,
      query,
      response: raw_response,
    },
    normalized: normalizeWikidataResponse({ response: raw_response, selection, request_url, retrieved_at: retrievedAt }),
  };
}

export async function writeWikidataSnapshot(snapshot, outputRoot) {
  const rawPath = resolve(outputRoot, "raw/wikidata.v1.json");
  const normalizedPath = resolve(outputRoot, "normalized/wikidata.v1.json");
  await mkdir(dirname(rawPath), { recursive: true });
  await mkdir(dirname(normalizedPath), { recursive: true });
  await writeFile(rawPath, stableJson(snapshot.raw));
  await writeFile(normalizedPath, stableJson(snapshot.normalized));
  return { rawPath, normalizedPath };
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const selection = JSON.parse(await readFile(resolve(root, "candidate/content-review/selections/wikidata-countries.v1.json"), "utf8"));
  const snapshot = await fetchWikidataSnapshot({ selection });
  const paths = await writeWikidataSnapshot(snapshot, resolve(root, "candidate/content-review"));
  process.stdout.write(`${stableJson({ records: snapshot.normalized.records.length, ...paths })}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
