export const LOCKED_LEARNING_CUE = Object.freeze({
  prompt: "Identify the current prompt to unlock a country fact.",
  country: "",
  fact: "",
  source_note: "Country facts appear here only after a correct answer and editorial approval.",
  reveal_allowed: false,
});

export function learningCuePreviewModel({ record, resolution, developmentPreview = false } = {}) {
  if (resolution !== "correct" && resolution !== "final") return LOCKED_LEARNING_CUE;
  if (!record) {
    return Object.freeze({
      ...LOCKED_LEARNING_CUE,
      source_note: "No country-fact candidate is available for this resolved answer.",
    });
  }
  const approved = record.founder_approval === "approved" && record.production_eligible === true;
  const canDisplayFact = approved || developmentPreview === true;
  return Object.freeze({
    prompt: "Country fact",
    country: record.display_name,
    fact: canDisplayFact ? record.proposed_fact : "",
    source_note: approved
      ? "Approved source: " + record.source.source_organization + "."
      : developmentPreview
        ? "Development-only candidate — founder approval pending. Source: " + record.source.source_organization + "."
        : "This country fact is pending founder approval and is unavailable in gameplay.",
    reveal_allowed: true,
    development_preview: developmentPreview === true && !approved,
    production_eligible: approved,
  });
}
