const CANDIDATE_STATUS = Object.freeze({
  technical_validation: "accepted",
  human_content_approval: "pending_review",
  gameplay_approval: "not_approved",
});

function assertPreviewCandidate(record) {
  if (
    record?.technical_validation !== CANDIDATE_STATUS.technical_validation ||
    record?.human_content_approval !== CANDIDATE_STATUS.human_content_approval ||
    record?.gameplay_approval !== CANDIDATE_STATUS.gameplay_approval
  ) {
    throw new Error("Preview accepts candidate-only records that remain blocked from gameplay");
  }
}

export function previewRecords(records) {
  if (!Array.isArray(records)) throw new Error("Preview records must be an array");
  records.forEach(assertPreviewCandidate);
  return records;
}

function seedNumber(seed) {
  return [...String(seed)].reduce(
    (hash, character) => ((hash * 31 + character.codePointAt(0)) >>> 0),
    2166136261,
  );
}

function nextRandom(state) {
  let value = state.value >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  state.value = value >>> 0;
  return state.value / 0x100000000;
}

export function selectPreviewQuestions(records, seed, count) {
  previewRecords(records);
  const safeCount = Math.max(0, Math.min(Number.isInteger(count) ? count : 0, records.length));
  const state = { value: seedNumber(seed) || 1 };
  const shuffled = [...records];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(nextRandom(state) * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled.slice(0, safeCount);
}

export function createPreviewResult(correct, total) {
  const validTotal = Math.max(0, Number.isFinite(total) ? Math.floor(total) : 0);
  const validCorrect = Math.max(0, Math.min(validTotal, Number.isFinite(correct) ? Math.floor(correct) : 0));
  return {
    correct: validCorrect,
    total: validTotal,
    accuracy: validTotal ? Math.round((validCorrect / validTotal) * 100) : 0,
    xp_awarded: 0,
    progression_eligible: false,
    daily_eligible: false,
    cloud_sync_eligible: false,
  };
}

export const PREVIEW_CANDIDATE_STATUS = CANDIDATE_STATUS;
