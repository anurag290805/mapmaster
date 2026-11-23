import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createReviewStatus, sha256, stableJson } from "./shared.mjs";

const API_ENDPOINT = "https://opentdb.com/api.php";
const TOKEN_ENDPOINT = "https://opentdb.com/api_token.php?command=request";
const CATEGORY = 22;
const BATCH_COUNT = 5;
const QUESTIONS_PER_BATCH = 10;
const MINIMUM_DELAY_MS = 5000;
const POLICY_WORDING = /\b(border|capital|continent|country|disputed|sovereignty|state|territor(?:y|ies))\b/i;

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function buildOpenTdbUrl(token) {
  if (!token) throw new Error("OpenTDB session token is required");
  return `${API_ENDPOINT}?amount=${QUESTIONS_PER_BATCH}&category=${CATEGORY}&encode=url3986&token=${encodeURIComponent(token)}`;
}

export function buildBatchRequests(token) {
  return Array.from({ length: BATCH_COUNT }, (_, index) => ({
    batch: index + 1,
    url: buildOpenTdbUrl(token),
  }));
}

function normalizeQuestion(item, batch, position, seen) {
  const question = decode(item?.question ?? "");
  const correctAnswer = decode(item?.correct_answer ?? "");
  const incorrectAnswers = Array.isArray(item?.incorrect_answers)
    ? item.incorrect_answers.map(decode)
    : [];
  const choices = [correctAnswer, ...incorrectAnswers];
  const fingerprint = sha256({
    category: item?.category,
    type: item?.type,
    difficulty: item?.difficulty,
    question,
    correct_answer: correctAnswer,
    incorrect_answers: incorrectAnswers,
  });
  const errors = [];
  const review_flags = [];
  if (item?.category !== "Geography") errors.push("unexpected_category");
  if (!question) errors.push("missing_question");
  if (!correctAnswer || !incorrectAnswers.length) errors.push("missing_answer_options");
  if ((item?.type === "multiple" && incorrectAnswers.length !== 3) || (item?.type === "boolean" && incorrectAnswers.length !== 1)) errors.push("invalid_choice_cardinality");
  if (new Set(choices.map((choice) => choice.trim().toLocaleLowerCase())).size !== choices.length) errors.push("duplicate_choice");
  if (seen.has(fingerprint)) errors.push("duplicate_source_fingerprint");
  seen.add(fingerprint);
  if (POLICY_WORDING.test(question)) review_flags.push("requires_geographic_policy_review");
  return {
    source_id: null,
    source_id_type: "not_provided_by_source",
    source_name: "Open Trivia DB",
    source_fingerprint: fingerprint,
    source_url: "https://opentdb.com/api.php?amount=10&category=22&encode=url3986",
    category: item?.category ?? null,
    type: item?.type ?? null,
    difficulty: item?.difficulty ?? null,
    question,
    correct_answer: correctAnswer,
    choices,
    source: { batch, position, original_encoded: item },
    ...createReviewStatus(errors.length ? "rejected" : "accepted"),
    validation_errors: errors,
    review_flags,
  };
}

export function normalizeOpenTdbBatches({ batches, retrieved_at }) {
  const seen = new Set();
  const records = [];
  for (const batch of [...batches].sort((a, b) => a.batch - b.batch)) {
    for (const [index, item] of (batch.response?.results ?? []).entries()) {
      records.push(normalizeQuestion(item, batch.batch, index + 1, seen));
    }
  }
  return {
    schema_version: 1,
    source: "opentdb",
    source_license: "CC-BY-SA-4.0",
    attribution: "Open Trivia DB, CC BY-SA 4.0 — https://opentdb.com/api_config.php",
    retrieved_at,
    raw_sha256: sha256(batches),
    records,
  };
}

export async function fetchOpenTdbSnapshot({ fetchImpl = fetch, retrievedAt = new Date().toISOString(), delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds)) }) {
  const tokenResponse = await fetchImpl(TOKEN_ENDPOINT, { headers: { Accept: "application/json" } });
  if (!tokenResponse.ok) throw new Error(`OpenTDB token request failed: ${tokenResponse.status}`);
  const tokenPayload = await tokenResponse.json();
  if (tokenPayload.response_code !== 0 || !tokenPayload.token) throw new Error(`OpenTDB token response failed: ${tokenPayload.response_code}`);
  const batches = [];
  for (const request of buildBatchRequests(tokenPayload.token)) {
    await delay(MINIMUM_DELAY_MS);
    const response = await fetchImpl(request.url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`OpenTDB batch ${request.batch} request failed: ${response.status}`);
    const payload = await response.json();
    if (payload.response_code !== 0) throw new Error(`OpenTDB batch ${request.batch} response failed: ${payload.response_code}`);
    if (!Array.isArray(payload.results) || payload.results.length !== QUESTIONS_PER_BATCH) throw new Error(`OpenTDB batch ${request.batch} did not return ${QUESTIONS_PER_BATCH} questions`);
    batches.push({
      batch: request.batch,
      retrieved_at: new Date().toISOString(),
      request_url: `${API_ENDPOINT}?amount=${QUESTIONS_PER_BATCH}&category=${CATEGORY}&encode=url3986`,
      response: payload,
    });
  }
  const raw = {
    schema_version: 1,
    source: "opentdb",
    source_license: "CC-BY-SA-4.0",
    attribution: "Open Trivia DB, CC BY-SA 4.0 — https://opentdb.com/api_config.php",
    retrieved_at: retrievedAt,
    category: CATEGORY,
    encoding: "url3986",
    batch_count: BATCH_COUNT,
    questions_per_batch: QUESTIONS_PER_BATCH,
    minimum_delay_ms: MINIMUM_DELAY_MS,
    token_persisted: false,
    batches,
  };
  return { raw, normalized: normalizeOpenTdbBatches({ batches, retrieved_at: retrievedAt }) };
}

export async function writeOpenTdbSnapshot(snapshot, outputRoot) {
  const rawPath = resolve(outputRoot, "raw/opentdb-geography.v1.json");
  const normalizedPath = resolve(outputRoot, "normalized/opentdb-geography.v1.json");
  await mkdir(dirname(rawPath), { recursive: true });
  await mkdir(dirname(normalizedPath), { recursive: true });
  await writeFile(rawPath, stableJson(snapshot.raw));
  await writeFile(normalizedPath, stableJson(snapshot.normalized));
  return { rawPath, normalizedPath };
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const selection = JSON.parse(await readFile(resolve(root, "candidate/content-review/selections/opentdb-geography.v1.json"), "utf8"));
  if (selection.batch_count !== BATCH_COUNT || selection.questions_per_batch !== QUESTIONS_PER_BATCH || selection.category !== CATEGORY || selection.minimum_delay_ms < MINIMUM_DELAY_MS) {
    throw new Error("OpenTDB selection does not satisfy the approved five-batch geography scope");
  }
  const snapshot = await fetchOpenTdbSnapshot({});
  const paths = await writeOpenTdbSnapshot(snapshot, resolve(root, "candidate/content-review"));
  process.stdout.write(stableJson({ records: snapshot.normalized.records.length, ...paths }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
