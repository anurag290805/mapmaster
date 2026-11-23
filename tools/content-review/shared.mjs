import { createHash } from "node:crypto";

export const CORPUS_SCHEMA_VERSION = 1;
export const CORPUS_STATUS = "candidate_not_live";
export const GAMEPLAY_APPROVAL = "not_approved";
export const HUMAN_CONTENT_APPROVAL = "pending_review";
export const TECHNICAL_VALIDATION = new Set([
  "accepted",
  "rejected",
  "pending_validation",
]);

export function createReviewStatus(technicalValidation, overrides = {}) {
  if (!TECHNICAL_VALIDATION.has(technicalValidation)) {
    throw new Error(`Unknown technical validation status: ${technicalValidation}`);
  }
  if (
    Object.hasOwn(overrides, "gameplay_approval") &&
    overrides.gameplay_approval !== GAMEPLAY_APPROVAL
  ) {
    throw new Error("Candidate records cannot receive gameplay approval");
  }
  if (
    Object.hasOwn(overrides, "human_content_approval") &&
    overrides.human_content_approval !== HUMAN_CONTENT_APPROVAL
  ) {
    throw new Error("Candidate records cannot receive human content approval");
  }
  return {
    technical_validation: technicalValidation,
    human_content_approval: HUMAN_CONTENT_APPROVAL,
    gameplay_approval: GAMEPLAY_APPROVAL,
  };
}

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function stableJson(value) {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

export function sha256(value) {
  const input = typeof value === "string" ? value : stableJson(value);
  return createHash("sha256").update(input).digest("hex");
}

export function assertCandidateStatus(record) {
  if (record?.gameplay_approval !== GAMEPLAY_APPROVAL) {
    throw new Error("Candidate record is not gameplay-blocked");
  }
  if (record?.human_content_approval !== HUMAN_CONTENT_APPROVAL) {
    throw new Error("Candidate record is not awaiting human review");
  }
  if (!TECHNICAL_VALIDATION.has(record?.technical_validation)) {
    throw new Error("Candidate record has an invalid technical validation status");
  }
  return true;
}
