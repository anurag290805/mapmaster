// Prepared integration seam only. CP04 remains the sole owner of gameplay state.
function candidateEntities(manifest) {
  const ids = new Set(),
    domIds = new Set();
  if (!Array.isArray(manifest.entities))
    throw new Error("Missing candidate entities");
  const identityPattern =
    manifest.identity_namespace === "mapmaster-question"
      ? /^[a-z]+:\d{3}$/
      : /^iso3166-1:[A-Z]{2}$/;
  return manifest.entities.map((entity) => {
    if (
      !identityPattern.test(entity.canonical_id || "") ||
      !entity.display_name ||
      !entity.dom_id
    )
      throw new Error("Invalid candidate identity");
    if (ids.has(entity.canonical_id) || domIds.has(entity.dom_id))
      throw new Error("Duplicate candidate identity");
    ids.add(entity.canonical_id);
    domIds.add(entity.dom_id);
    return {
      id: entity.canonical_id,
      name: entity.display_name,
      domId: entity.dom_id,
    };
  });
}

export function createCandidateAdapter(
  manifest,
  questionNames,
  currentSession,
) {
  if (typeof currentSession !== "function")
    throw new Error("Authoritative session accessor required");
  const entities = candidateEntities(manifest);
  const names = new Set(questionNames);
  if (
    names.size !== questionNames.length ||
    names.size !== entities.length ||
    entities.some((e) => !names.has(e.name))
  )
    throw new Error("Candidate coverage mismatch");
  const byId = new Map(entities.map((e) => [e.id, e.name]));
  const domById = new Map(entities.map((e) => [e.id, e.domId]));
  let activeDocument = null,
    activeSession = null,
    cleanup = () => {};
  function dispose() {
    cleanup();
    cleanup = () => {};
    activeDocument = null;
    activeSession = null;
  }
  function resolve({ document, session, id }) {
    const authoritativeSession = currentSession();
    if (
      !activeDocument ||
      document !== activeDocument ||
      session !== activeSession ||
      authoritativeSession !== session
    )
      return null;
    return byId.get(id) || null;
  }
  function activate(doc, session, onSelect) {
    dispose();
    activeDocument = doc;
    activeSession = session;
    if (typeof onSelect === "function") {
      let pointer = null;
      function identity(target) {
        const group = target?.closest?.("g[data-canonical-id]");
        if (
          !group ||
          group.ownerDocument !== doc ||
          !doc.contains(group) ||
          domById.get(group.dataset.canonicalId) !== group.id
        )
          return null;
        return group.dataset.canonicalId;
      }
      function emit(id, event) {
        const name = resolve({ document: doc, session, id });
        if (name) onSelect(name, event);
      }
      const down = (event) => {
        if (pointer) return;
        // On Chromium touch input, transformed SVG paths can report a stale
        // event target even when the same client coordinates visually hit a
        // different candidate path. Resolve the live hit target first; the
        // event target remains a fallback for assistive or synthetic input.
        const id =
          identity(doc.elementFromPoint?.(event.clientX, event.clientY)) ||
          identity(event.target);
        if (id)
          pointer = {
            id,
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            moved: false,
          };
      };
      const move = (event) => {
        if (
          pointer &&
          pointer.pointerId === event.pointerId &&
          Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 6
        )
          pointer.moved = true;
      };
      const up = (event) => {
        if (!pointer || pointer.pointerId !== event.pointerId) return;
        const held = pointer;
        pointer = null;
        if (
          !held.moved &&
          Math.hypot(event.clientX - held.x, event.clientY - held.y) <= 6
        )
          emit(held.id, event);
      };
      const cancel = () => {
        pointer = null;
      };
      // Keyboard/assistive-technology click; pointer clicks are already handled on pointerup.
      const click = (event) => {
        if (event.detail > 0) return;
        const id = identity(event.target);
        if (id) emit(id, event);
      };
      const listeners = {
        pointerdown: down,
        pointermove: move,
        pointerup: up,
        pointercancel: cancel,
        click,
      };
      for (const [type, listener] of Object.entries(listeners))
        doc.addEventListener(type, listener);
      cleanup = () => {
        pointer = null;
        for (const [type, listener] of Object.entries(listeners))
          doc.removeEventListener(type, listener);
      };
    }
  }
  return { activate, resolve, dispose };
}
