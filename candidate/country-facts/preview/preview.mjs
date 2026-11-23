import { COUNTRY_FACT_CATALOG } from "../catalog.v1.mjs";
import { learningCuePreviewModel } from "../learning-cue-preview-core.mjs";

const select = document.querySelector("#countrySelect");
const cue = {
  prompt: document.querySelector("#cuePrompt"),
  country: document.querySelector("#cueCountry"),
  fact: document.querySelector("#cueFact"),
  source: document.querySelector("#cueSource"),
};

for (const record of COUNTRY_FACT_CATALOG) {
  select.add(new Option(record.display_name, record.canonical_id));
}

function selectedRecord() {
  return COUNTRY_FACT_CATALOG.find((record) => record.canonical_id === select.value);
}

function renderCue(resolution) {
  const model = learningCuePreviewModel({ record: selectedRecord(), resolution, developmentPreview: true });
  cue.prompt.textContent = model.prompt;
  cue.country.textContent = model.country;
  cue.fact.textContent = model.fact;
  cue.source.textContent = model.source_note;
}

document.querySelector("#lockedButton").addEventListener("click", () => renderCue("retry"));
document.querySelector("#resolvedButton").addEventListener("click", () => renderCue("correct"));
select.addEventListener("change", () => renderCue("correct"));

const pending = COUNTRY_FACT_CATALOG.filter((record) => record.founder_approval === "pending_founder_approval").length;
document.querySelector("#summary").textContent = COUNTRY_FACT_CATALOG.length + " catalog slots · " + pending + " founder-pending · 0 production-eligible";

const ledger = document.querySelector("#ledger");
for (const record of COUNTRY_FACT_CATALOG) {
  const row = document.createElement("tr");
  const decision = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.disabled = true;
  checkbox.setAttribute("aria-label", "Founder approval required for " + record.display_name);
  decision.append(checkbox, document.createTextNode(" Founder action required"));
  const evidence = document.createElement("a");
  evidence.href = record.source.country_url;
  evidence.textContent = record.source.country_entity_id + " " + record.source.property;
  evidence.target = "_blank";
  evidence.rel = "noreferrer";
  const values = [decision, record.display_name, record.proposed_fact, evidence, record.verification_status];
  for (const value of values) {
    const cell = document.createElement("td");
    if (value instanceof Node) cell.append(value); else cell.textContent = value;
    row.append(cell);
  }
  ledger.append(row);
}
renderCue("retry");
