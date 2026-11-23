// Development-only bridge between the isolated candidate and CP04 Locate.
// This module is loaded only from localhost:4174 with ?cp05Candidate=1.
import { createCandidateAdapter } from "./world-map-adapter.mjs";
import { clampView, resetView } from "../pilot/core.mjs";

const devHost = location.hostname === "127.0.0.1" && location.port === "4174";

export function startControlledCandidateIntegration(bridge) {
  if (!devHost) return { dispose() {} };
  const candidateConfig = bridge.candidateConfig?.() || {
    kind: "world",
    scope: "world",
  };

  let svg = null;
  let adapter = null;
  let controls = null;
  let abort = null;
  let generation = 0;
  let view = resetView();
  let drag = null;

  const current = () => bridge.currentSession();
  const wantsCandidateMap = () => bridge.isCandidateMapSession();
  const eligible = () => bridge.isCandidateLocateSession();

  function dispose() {
    generation += 1;
    abort?.abort();
    abort = null;
    adapter?.dispose();
    adapter = null;
    drag = null;
    controls?.remove();
    controls = null;
    svg?.remove();
    svg = null;
    bridge.mapContainer()?.classList.remove("cp05-candidate-map-container");
    window.__mapmasterCandidateSvg = null;
    bridge.showClassicMap();
  }

  function applyView() {
    view = clampView(view);
    svg
      ?.querySelector("#candidate-layer")
      ?.setAttribute(
        "transform",
        `translate(${view.x} ${view.y}) scale(${view.scale})`,
      );
  }

  function selectedId() {
    return controls?.querySelector("select")?.value || "";
  }

  function focusSelected() {
    const id = selectedId();
    const group = svg?.querySelector(`g[data-canonical-id="${id}"]`);
    if (!group) return;
    const paths = [...group.querySelectorAll("path")];
    const largest = paths.reduce(
      (best, path) => {
        const box = path.getBBox();
        return box.width * box.height > best.area
          ? { box, area: box.width * box.height }
          : best;
      },
      { box: null, area: -1 },
    );
    if (!largest.box) return;
    const box = largest.box;
    view = {
      scale: 5,
      x: -5 * (box.x + box.width / 2),
      y: -5 * (box.y + box.height / 2),
    };
    applyView();
    group.focus({ preventScroll: true });
    bridge.feedback(`Map focused on ${group.dataset.displayName}.`);
  }

  function installControls(entities) {
    if (!document.getElementById("cp05CandidateStyle")) {
      const style = document.createElement("style");
      style.id = "cp05CandidateStyle";
      style.textContent = `
        #cp05CandidateControls { margin: 0 0 1rem; padding: .8rem; border: 1px solid var(--accent, #1558C9); border-radius: .7rem; background: #1A1A1A; color: white; }
        #cp05CandidateControls p { margin: 0 0 .65rem; }
        #cp05CandidateControls button, #cp05CandidateControls select { min-height: 2.5rem; margin: .18rem; }
        #cp05CandidateControls button:focus-visible, #cp05CandidateControls select:focus-visible, .cp05-candidate-svg g:focus-visible { outline: 3px solid #32CD32; outline-offset: 3px; }
        .cp05-candidate-svg { width: 100%; height: 100%; touch-action: none; background: #1558C9; }
        .cp05-candidate-svg path { fill: #32CD32; stroke: #1A1A1A; stroke-width: .14; vector-effect: non-scaling-stroke; cursor: pointer; }
        .cp05-candidate-svg g:focus-visible path { stroke: white; stroke-width: .8; }
        #mapContainer.cp05-candidate-map-container { min-height: 30rem; justify-content: flex-start; }
        #mapContainer.cp05-candidate-map-container #mapZoomWrapper { min-height: 20rem; }
        @media (max-width: 640px) {
          #mapContainer.cp05-candidate-map-container { min-height: 34rem; }
          #mapContainer.cp05-candidate-map-container #mapZoomWrapper { min-height: 18rem; }
          #cp05CandidateControls { font-size: .85rem; }
        }
        @media (prefers-reduced-motion: reduce) { .cp05-candidate-svg, .cp05-candidate-svg * { transition: none !important; animation: none !important; } }
      `;
      document.head.append(style);
    }
    controls = document.createElement("section");
    controls.id = "cp05CandidateControls";
    controls.setAttribute("aria-label", "Development candidate map controls");
    const targetTerm = candidateConfig.kind === "world" ? "country" : "target";
    controls.innerHTML = `
      <p><strong>CP05 development-only candidate</strong> — uses the live CP04 Locate session. Not a public game mode.</p>
      <div class="cp05-candidate-views" role="group" aria-label="Candidate map view controls">
        <button type="button" data-view="in">Zoom in</button>
        <button type="button" data-view="out">Zoom out</button>
        <button type="button" data-view="left">Pan left</button>
        <button type="button" data-view="right">Pan right</button>
        <button type="button" data-view="up">Pan up</button>
        <button type="button" data-view="down">Pan down</button>
        <button type="button" data-view="reset">Reset view</button>
        <button type="button" data-view="reload">Reload candidate</button>
      </div>
      <form class="cp05-candidate-chooser">
        <label>Choose a ${targetTerm} <select required><option value="">Select a ${targetTerm}</option></select></label>
        <button type="submit">Submit ${targetTerm}</button>
        <button type="button" data-view="focus">Focus selected ${targetTerm}</button>
      </form>
    `;
    const chooser = controls.querySelector("select");
    for (const entity of entities) {
      const option = document.createElement("option");
      option.value = entity.canonical_id;
      option.textContent = entity.display_name;
      chooser.append(option);
    }
    controls.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = adapter?.resolve({
        document,
        session: current(),
        id: selectedId(),
      });
      if (name) bridge.submitLocate(name);
    });
    controls.addEventListener("click", (event) => {
      const action = event.target.closest("button")?.dataset.view;
      if (!action) return;
      if (action === "in") view = { ...view, scale: view.scale * 1.25 };
      if (action === "out") view = { ...view, scale: view.scale / 1.25 };
      if (action === "left") view = { ...view, x: view.x - 25 };
      if (action === "right") view = { ...view, x: view.x + 25 };
      if (action === "up") view = { ...view, y: view.y - 20 };
      if (action === "down") view = { ...view, y: view.y + 20 };
      if (action === "reset") view = resetView();
      if (action === "reload") mount();
      if (action === "focus") focusSelected();
      applyView();
    });
    bridge.mapContainer().prepend(controls);
  }

  function installSvg(root, manifest, session, token) {
    const entities = manifest.entities;
    const layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    layer.id = "candidate-layer";
    while (root.firstChild) layer.append(root.firstChild);
    root.append(layer);
    root.dataset.mapmasterCandidate = "true";
    root.dataset.mapmasterCandidates = JSON.stringify(
      entities.map((entity) => entity.display_name),
    );
    root.setAttribute("aria-label", "World map selection area");
    root.setAttribute("role", "application");
    root.setAttribute("preserveAspectRatio", "xMidYMid meet");
    root.classList.add("cp05-candidate-svg");

    for (const [index, entity] of entities.entries()) {
      const group = root.querySelector(`#${entity.dom_id}`);
      if (
        !group ||
        (group.dataset.canonicalId &&
          group.dataset.canonicalId !== entity.canonical_id)
      )
        throw new Error("candidate identity mismatch");
      group.dataset.canonicalId = entity.canonical_id;
      group.dataset.displayName = entity.display_name;
      group.setAttribute("tabindex", "0");
      group.setAttribute("role", "button");
      group.setAttribute("aria-label", `Map target ${index + 1}`);
    }

    adapter = createCandidateAdapter(manifest, bridge.questionNames(), current);
    adapter.activate(document, session, bridge.submitLocate);
    abort = new AbortController();
    const signal = abort.signal;
    root.addEventListener(
      "keydown",
      (event) => {
        const group = event.target.closest?.("g[data-canonical-id]");
        if (!group || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        group.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      },
      { signal },
    );
    root.addEventListener(
      "pointerdown",
      (event) => {
        if (!eligible() || drag) return;
        drag = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          lastX: event.clientX,
          lastY: event.clientY,
          moved: false,
        };
        root.setPointerCapture?.(event.pointerId);
      },
      { signal },
    );
    root.addEventListener(
      "pointermove",
      (event) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        const dx = event.clientX - drag.lastX;
        const dy = event.clientY - drag.lastY;
        if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6)
          drag.moved = true;
        if (drag.moved) {
          const rect = root.getBoundingClientRect();
          view = {
            ...view,
            x: view.x + (dx * 360) / rect.width,
            y: view.y + (dy * 180) / rect.height,
          };
          applyView();
        }
        drag.lastX = event.clientX;
        drag.lastY = event.clientY;
      },
      { signal },
    );
    root.addEventListener(
      "pointerup",
      (event) => {
        if (drag?.pointerId === event.pointerId) drag = null;
      },
      { signal },
    );
    root.addEventListener(
      "pointercancel",
      () => {
        drag = null;
      },
      { signal },
    );
    root.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        view = {
          ...view,
          scale: view.scale * (event.deltaY < 0 ? 1.2 : 1 / 1.2),
        };
        applyView();
      },
      { passive: false, signal },
    );

    svg = root;
    view = resetView();
    bridge.hideClassicMap();
    bridge.mapContainer().classList.add("cp05-candidate-map-container");
    bridge.mapWrapper().append(root);
    window.__mapmasterCandidateSvg = root;
    installControls(entities);
    applyView();
    bridge.rebindLocate();
    bridge.feedback("Candidate map ready for this CP05 development session.");
    if (token !== generation || !wantsCandidateMap()) dispose();
  }

  async function mount() {
    dispose();
    if (!wantsCandidateMap()) return;
    const token = ++generation;
    const session = current();
    bridge.feedback("Loading CP05 candidate map.");
    try {
      const manifestResponse = await fetch(
        new URL(
          candidateConfig.kind === "world"
            ? "../candidate/world-manifest.json"
            : "../candidate/admin1/manifest.json",
          import.meta.url,
        ),
        { cache: "no-store" },
      );
      if (!manifestResponse.ok)
        throw new Error("candidate manifest request failed");
      const sourceManifest = await manifestResponse.json();
      const scope =
        candidateConfig.kind === "world"
          ? null
          : sourceManifest.scopes?.[candidateConfig.scope];
      if (
        candidateConfig.kind !== "world" &&
        (!scope ||
          scope.status !==
            "candidate_ready_for_manual_geometry_and_interaction_review" ||
          !scope.asset)
      )
        throw new Error("candidate scope is not ready for controlled testing");
      const manifest =
        candidateConfig.kind === "world"
          ? sourceManifest
          : {
              identity_namespace: "mapmaster-question",
              entities: scope.mappings.map((mapping) => ({
                canonical_id: mapping.question_key,
                display_name: mapping.display_name,
                dom_id: mapping.dom_id,
                polygon_parts: mapping.source_polygon_count,
              })),
            };
      const svgResponse = await fetch(
        new URL(
          candidateConfig.kind === "world"
            ? "../candidate/world.svg"
            : `../${scope.asset}`,
          import.meta.url,
        ),
        { cache: "no-store" },
      );
      if (!svgResponse.ok) throw new Error("candidate SVG request failed");
      const source = await svgResponse.text();
      if (token !== generation || !wantsCandidateMap() || current() !== session)
        return;
      const doc = new DOMParser().parseFromString(source, "image/svg+xml");
      if (
        doc.querySelector("parsererror") ||
        doc.documentElement.localName !== "svg"
      )
        throw new Error("invalid candidate SVG");
      const root = document.importNode(doc.documentElement, true);
      const targetSelector =
        candidateConfig.kind === "world"
          ? "#countries > g[data-canonical-id]"
          : "g[data-question-key]";
      if (
        root.querySelectorAll(targetSelector).length !==
        manifest.entities.length
      )
        throw new Error("candidate coverage mismatch");
      installSvg(root, manifest, session, token);
    } catch (error) {
      if (token === generation)
        bridge.feedback(`Candidate map could not be loaded: ${error.message}`);
    }
  }

  const screenListener = (event) => {
    if (event.detail.screen === "game" && wantsCandidateMap()) mount();
    else if (event.detail.screen !== "game") dispose();
  };
  document.addEventListener("mapmaster:screen", screenListener);
  return {
    dispose: () => {
      document.removeEventListener("mapmaster:screen", screenListener);
      dispose();
    },
  };
}

if (window.__mapmasterCandidateBridge) {
  window.__mapmasterCandidateIntegration = startControlledCandidateIntegration(
    window.__mapmasterCandidateBridge,
  );
}
