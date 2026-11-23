import {
  applyReleaseRevision,
  prepareReleasePreview,
  selectReleasePreviewRecords,
} from "./external-content-release-prep-core.mjs";

const bridge = window.__mapmasterExternalContentPreview;
const PREVIEW_SEED = new URLSearchParams(location.search).get("externalGeoSeed") || "external-geo-release-prep-v1";
const CANDIDATE_PATH = "/candidate/content-review/";
const RELEASE_MANIFEST = "release-prep/first-geography-release.v2.json";
const RELEASE_REVISION = "release-prep/first-geography-release.v3.json";

function element(name, options = {}) {
  const node = document.createElement(name);
  if (options.className) node.className = options.className;
  if (options.text) node.textContent = options.text;
  if (options.type) node.type = options.type;
  if (options.id) node.id = options.id;
  if (options.attributes) Object.entries(options.attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

async function localJson(path) {
  // This fixed path keeps the development-only manifest out of production assets.
  const response = await fetch(`${CANDIDATE_PATH}${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Release-preparation source unavailable: ${path}`);
  return response.json();
}

function evidenceLink(record) {
  const link = element("a", { text: `Source: ${record.source} ${record.source_id}` });
  link.href = record.source_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function renderEvidence(container, record) {
  const details = element("dl", { className: "external-facts" });
  const claim = record.claim.property || `${record.claim.feature_class}/${record.claim.feature_code}`;
  const qualifiers = record.claim.qualifiers?.length ? `; ${record.claim.qualifiers.join("; ")}` : "";
  [
    ["Canonical identity", record.canonical_identity],
    ["Source / retrieval", `${record.source} ${record.source_id}; ${record.retrieved_at}`],
    ["Frozen evidence", record.frozen_evidence],
    ["Claim / qualifiers", `${claim}${qualifiers}`],
    ["Uncertainty", record.uncertainty],
  ].forEach(([label, value]) => details.append(element("dt", { text: label }), element("dd", { text: value })));
  container.append(details, evidenceLink(record));
  const independentEvidence = (record.editorial_evidence || []).filter(
    (item) => item.role !== "country-code mapping" && item.url,
  );
  if (independentEvidence.length) {
    const sources = element("ul", {
      className: "external-editorial-evidence",
      attributes: { "aria-label": "Independent evidence" },
    });
    independentEvidence.forEach((item) => {
      const link = element("a", { text: item.role });
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const listItem = element("li");
      listItem.append(link);
      sources.append(listItem);
    });
    container.append(element("h4", { text: "Independent evidence" }), sources);
  }
}

function renderCountryExplorer(container, countries) {
  const chooser = element("select", { attributes: { "aria-label": "Choose a proposed country fact" } });
  countries.forEach((country) => {
    const option = element("option", { text: country.canonical_identity });
    option.value = country.proposal_id;
    chooser.append(option);
  });
  const detail = element("section", { className: "external-country-detail", attributes: { "aria-live": "polite" } });
  const show = () => {
    const country = countries.find((item) => item.proposal_id === chooser.value) || countries[0];
    detail.replaceChildren();
    detail.append(element("h3", { text: country.canonical_identity }));
    detail.append(element("p", { className: "external-player-content", text: country.player_facing.display }));
    detail.append(element("p", { className: "external-source-id", text: `Proposed prompt: ${country.player_facing.prompt}` }));
    renderEvidence(detail, country);
  };
  chooser.addEventListener("change", show);
  container.replaceChildren(
    element("h2", { text: "Country Explorer" }),
    element("p", { text: "Preview only proposed current, dated facts. Historical and source-qualified claims remain preserved but are not player-facing proposals." }),
    chooser,
    detail,
  );
  show();
}

function renderPlaceChallenge(container, records, kind) {
  const isCity = kind === "city";
  const prompt = element("p", { className: "external-place-prompt", attributes: { "aria-live": "polite" } });
  const choices = element("div", { className: "external-choice-list", attributes: { role: "group", "aria-label": isCity ? "City choices" : "Geographic feature choices" } });
  const evidence = element("section", { className: "external-place-evidence" });
  const next = element("button", { type: "button", text: isCity ? "Next city" : "Next feature" });
  let position = 0;
  const queue = selectReleasePreviewRecords(records, `${PREVIEW_SEED}:${kind}`, records.length);
  const show = () => {
    const target = queue[position % queue.length];
    prompt.textContent = target.player_facing.prompt;
    choices.replaceChildren();
    evidence.replaceChildren();
    if (!isCity) {
      evidence.append(
        element("h3", { text: target.canonical_identity }),
        element("p", { className: "external-player-content", text: target.player_facing.display }),
        element("p", { className: "external-learning-fact", text: target.player_facing.learning_fact }),
        element("p", { text: target.player_facing.explanation }),
      );
      renderEvidence(evidence, target);
      return;
    }
    target.player_facing.choices.forEach((choice) => {
      const button = element("button", { type: "button", text: choice });
      button.addEventListener("click", () => {
        const correct = choice === target.player_facing.answer;
        [...choices.querySelectorAll("button")].forEach((item) => { item.disabled = true; });
        prompt.textContent = `${correct ? "Matched" : "Correct answer"}: ${target.player_facing.answer}. 0 XP awarded.`;
        renderEvidence(evidence, target);
      });
      choices.append(button);
    });
  };
  next.addEventListener("click", () => { position += 1; show(); });
  container.replaceChildren(
    element("h2", { text: isCity ? "City Challenge" : "Feature learning" }),
    element("p", { text: isCity ? "A deterministic, non-rewarding city–country matching preview. Coordinates remain evidence metadata, not a puzzle clue." : "A deterministic, non-rewarding feature-learning preview. Each card pairs its retained classification with an independently sourced fact and caveat." }),
    prompt,
    choices,
    evidence,
    next,
  );
  show();
}

function renderFounderChecklist(container, records, attribution) {
  const bulk = element("section", { className: "external-bulk-approval" });
  bulk.append(
    element("h3", { text: "Reviewed, unambiguous bulk set — 50 proposed items" }),
    element("p", { text: "A bulk decision may be recorded only as an explicit founder action after the individual list is reviewed. It is not executed here." }),
    element("button", { type: "button", text: "Founder action required — no approval recorded", attributes: { disabled: "" } }),
  );
  const list = element("ol", { className: "external-approval-list", attributes: { "aria-label": "Individual founder decisions" } });
  records.forEach((record) => {
    const item = element("li", { className: "external-approval-item" });
    item.append(
      element("h3", { text: record.proposal_id }),
      element("p", { className: "external-player-content", text: `${record.player_facing.prompt} Answer/display: ${record.player_facing.answer}.` }),
      element("span", { className: "external-pending", text: "Pending founder approval" }),
    );
    renderEvidence(item, record);
    item.append(element("button", { type: "button", text: `Approval pending: ${record.proposal_id}`, attributes: { disabled: "" } }));
    list.append(item);
  });
  container.replaceChildren(
    element("h2", { text: "Founder approval checklist" }),
    element("p", { text: "Individual founder decisions are required for every player-facing claim or question. This preview is read-only and cannot record approval or promote content." }),
    bulk,
    element("p", { className: "external-preview-note", text: `Attribution: ${attribution.wikidata.notice} ${attribution.geonames.notice}` }),
    list,
  );
}

async function mount() {
  if (!bridge?.isEligible?.()) return;
  const [manifest, revision] = await Promise.all([
    localJson(RELEASE_MANIFEST),
    localJson(RELEASE_REVISION),
  ]);
  manifest.records = applyReleaseRevision(manifest.records, revision);
  const prepared = prepareReleasePreview(manifest.records);
  const records = [...prepared.countryExplorer, ...prepared.cityChallenges, ...prepared.featureLearning];
  records.forEach((record) => {
    const defaults = manifest.source_evidence_defaults[record.source];
    record.retrieved_at ||= defaults.retrieved_at;
    record.source_url ||= defaults.source_url_template.replace("{source_id}", record.source_id);
  });
  const root = element("section", { id: "externalGeoPreview", className: "external-geo-preview", attributes: { "aria-labelledby": "externalGeoPreviewTitle" } });
  const tabs = element("div", { className: "external-preview-tabs", attributes: { role: "tablist", "aria-label": "First geography release preparation modes" } });
  const panel = element("section", { id: "externalGeoPreviewPanel", className: "external-preview-panel", attributes: { role: "tabpanel" } });
  const renderers = [
    ["explorer", "Country explorer", () => renderCountryExplorer(panel, prepared.countryExplorer)],
    ["cities", "City challenge", () => renderPlaceChallenge(panel, prepared.cityChallenges, "city")],
    ["features", "Feature learning", () => renderPlaceChallenge(panel, prepared.featureLearning, "feature")],
    ["checklist", "Founder checklist", () => renderFounderChecklist(panel, records, manifest.attribution)],
  ];
  const activate = (key) => {
    renderers.forEach(([id, , render]) => {
      const tab = tabs.querySelector(`[data-preview-tab="${id}"]`);
      const active = id === key;
      tab?.setAttribute("aria-selected", String(active));
      if (tab) tab.tabIndex = active ? 0 : -1;
      if (active && tab) panel.setAttribute("aria-labelledby", tab.id);
      if (active) render();
    });
  };
  renderers.forEach(([id, label], index) => {
    const tab = element("button", { id: `externalGeoPreviewTab-${id}`, type: "button", text: label, attributes: { role: "tab", "aria-controls": "externalGeoPreviewPanel", "data-preview-tab": id, "aria-selected": "false", tabindex: index === 0 ? "0" : "-1" } });
    tab.addEventListener("click", () => activate(id));
    tab.addEventListener("keydown", (event) => {
      const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let nextIndex = index;
      if (event.key in direction) nextIndex = (index + direction[event.key] + renderers.length) % renderers.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = renderers.length - 1;
      else return;
      event.preventDefault();
      const [nextId] = renderers[nextIndex];
      activate(nextId);
      tabs.querySelector(`[data-preview-tab="${nextId}"]`)?.focus();
    });
    tabs.append(tab);
  });
  root.append(
    element("h1", { id: "externalGeoPreviewTitle", text: "First geography release preparation" }),
    element("p", { className: "external-preview-note", text: `${records.length} proposed items. Candidate content only: every item is pending founder approval; no XP, progression, Daily Challenge, cloud save, or public gameplay use.` }),
    tabs,
    panel,
  );
  document.querySelector("main")?.before(root);
  activate("explorer");
}

mount().catch((error) => bridge?.fail?.(error));
