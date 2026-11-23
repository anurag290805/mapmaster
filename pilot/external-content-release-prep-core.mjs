const ALLOWED_SOURCES = new Set(["wikidata", "geonames"]);
const ALLOWED_USES = new Set([
  "country_explorer",
  "city_challenge",
  "feature_learning",
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function applyReleaseRevision(baseRecords, revision) {
  if (!Array.isArray(baseRecords)) throw new Error("Revision base records must be an array");
  if (!revision || !Array.isArray(revision.record_patches)) {
    throw new Error("Release revision must contain record patches");
  }
  const baseById = new Map(baseRecords.map((record) => [record.proposal_id, record]));
  const patchedIds = new Set();
  const patchesById = new Map();
  revision.record_patches.forEach((patch) => {
    if (!patch?.proposal_id || !baseById.has(patch.proposal_id)) {
      throw new Error(`Release revision has an unknown proposal identity: ${patch?.proposal_id || "missing"}`);
    }
    if (patchedIds.has(patch.proposal_id)) {
      throw new Error(`Release revision duplicates proposal identity: ${patch.proposal_id}`);
    }
    patchedIds.add(patch.proposal_id);
    patchesById.set(patch.proposal_id, patch);
  });
  return baseRecords.map((record) => {
    const patch = patchesById.get(record.proposal_id);
    if (!patch) return clone(record);
    const { proposal_id, ...changes } = patch;
    return {
      ...clone(record),
      ...clone(changes),
      player_facing: patch.player_facing ? clone(patch.player_facing) : clone(record.player_facing),
      editorial_evidence: patch.editorial_evidence
        ? clone(patch.editorial_evidence)
        : clone(record.editorial_evidence || []),
    };
  });
}

function assertProposal(record) {
  if (!ALLOWED_SOURCES.has(record?.source)) {
    throw new Error("OpenTDB and other non-release sources are excluded from release preparation");
  }
  if (record.factual_classification === "rejected") {
    throw new Error("Rejected proposals cannot enter release preparation");
  }
  if (record.approval_state !== "pending_founder_approval") {
    throw new Error("Release proposals must remain pending founder approval");
  }
  if (!ALLOWED_USES.has(record.use)) {
    throw new Error("Release proposal has an unsupported player-facing use");
  }
  if (!record.proposal_id || !record.source_id || !record.player_facing?.prompt || !record.player_facing?.answer) {
    throw new Error("Release proposal lacks its stable identity or player-facing content");
  }
}

export function prepareReleasePreview(records) {
  if (!Array.isArray(records)) throw new Error("Release proposals must be an array");
  records.forEach(assertProposal);
  const duplicate = records.find(
    (record, index) => records.findIndex((item) => item.proposal_id === record.proposal_id) !== index,
  );
  if (duplicate) throw new Error(`Release proposal identity is duplicated: ${duplicate.proposal_id}`);
  const byUse = (use) => records.filter((record) => record.use === use);
  return {
    countryExplorer: byUse("country_explorer"),
    cityChallenges: byUse("city_challenge"),
    featureLearning: byUse("feature_learning"),
    approvalChecklist: {
      pending: records.length,
      bulkEligible: records.length,
      approvalAction: "founder_action_required",
    },
  };
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

export function selectReleasePreviewRecords(records, seed, count) {
  if (!Array.isArray(records)) throw new Error("Release preview records must be an array");
  const safeCount = Math.max(0, Math.min(Number.isInteger(count) ? count : 0, records.length));
  const state = { value: seedNumber(seed) || 1 };
  const shuffled = [...records];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(nextRandom(state) * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled.slice(0, safeCount);
}
