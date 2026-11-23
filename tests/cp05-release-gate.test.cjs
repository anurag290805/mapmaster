const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

test("public-beta build fails closed while inherited SVG rights remain blocked", () => {
  const result = spawnSync("npm", ["run", "build:public-beta"], {
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}${result.stderr}`,
    /CP05 public-beta build blocked/,
  );
});

test("candidate adapter resolves only valid manifest-backed active document targets", async () => {
  const { createCandidateAdapter } =
    await import("../js/world-map-adapter.mjs");
  const manifest = {
    entities: [
      {
        canonical_id: "iso3166-1:CA",
        display_name: "Canada",
        dom_id: "country-CA",
        polygon_parts: 2,
      },
    ],
  };
  let session = "session-1";
  const adapter = createCandidateAdapter(manifest, ["Canada"], () => session);
  const doc = {},
    other = {};
  adapter.activate(doc, "session-1");
  assert.equal(
    adapter.resolve({
      document: doc,
      session: "session-1",
      id: "iso3166-1:CA",
    }),
    "Canada",
  );
  assert.equal(
    adapter.resolve({
      document: other,
      session: "session-1",
      id: "iso3166-1:CA",
    }),
    null,
  );
  assert.equal(
    adapter.resolve({
      document: doc,
      session: "session-2",
      id: "iso3166-1:CA",
    }),
    null,
  );
  assert.equal(
    adapter.resolve({
      document: doc,
      session: "session-1",
      id: "iso3166-1:BR",
    }),
    null,
  );
  session = "session-2";
  assert.equal(
    adapter.resolve({
      document: doc,
      session: "session-1",
      id: "iso3166-1:CA",
    }),
    null,
  );
  adapter.dispose();
  assert.equal(
    adapter.resolve({
      document: doc,
      session: "session-1",
      id: "iso3166-1:CA",
    }),
    null,
  );
  assert.throws(
    () => createCandidateAdapter(manifest, ["Canada", "Brazil"], () => session),
    /coverage/i,
  );
  assert.throws(() => createCandidateAdapter(manifest, ["Canada"]), /session/i);
});

test("candidate adapter accepts Admin-1 question keys only when the manifest explicitly declares that namespace", async () => {
  const { createCandidateAdapter } =
    await import("../js/world-map-adapter.mjs");
  const manifest = {
    identity_namespace: "mapmaster-question",
    entities: [
      {
        canonical_id: "australia:001",
        display_name: "Australian Capital Territory",
        dom_id: "cp05-australia-aus-2653",
      },
    ],
  };
  const adapter = createCandidateAdapter(
    manifest,
    ["Australian Capital Territory"],
    () => 7,
  );
  const doc = {};
  adapter.activate(doc, 7);
  assert.equal(
    adapter.resolve({ document: doc, session: 7, id: "australia:001" }),
    "Australian Capital Territory",
  );
  assert.throws(
    () =>
      createCandidateAdapter(
        { entities: manifest.entities },
        ["Australian Capital Territory"],
        () => 7,
      ),
    /Invalid candidate identity/,
  );
});

test("numeric SVG serialization is lossless and leaves non-path text unchanged", async () => {
  const { optimizeSvg } = await import("../tools/optimize-world-candidate.mjs");
  const input =
    '<svg viewBox="-180 -90 360 180"><path id="x" d="M0.50000000,-0.25000000L1.00000000,0.00000000Z"/></svg>';
  const output = optimizeSvg(input);
  assert.equal(
    output,
    '<svg viewBox="-180 -90 360 180"><path id="x" d="M.5,-.25L1,0Z"/></svg>',
  );
});

test("full SVG path coordinates and non-path markup are numerically unchanged by optimization", async () => {
  const fs = require("node:fs");
  const { optimizeSvg } = await import("../tools/optimize-world-candidate.mjs");
  const original = fs.readFileSync("candidate/world.svg", "utf8");
  const optimized = optimizeSvg(original);
  const pathPattern = /(\sd=")([^"]*)(")/g;
  const oldPaths = [...original.matchAll(pathPattern)],
    newPaths = [...optimized.matchAll(pathPattern)];
  assert.equal(oldPaths.length, newPaths.length);
  assert.equal(
    original.replace(pathPattern, ' d=""'),
    optimized.replace(pathPattern, ' d=""'),
  );
  const tokens = /[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)/g;
  for (let i = 0; i < oldPaths.length; i++) {
    const a = oldPaths[i][2].match(tokens),
      b = newPaths[i][2].match(tokens);
    assert.equal(a.length, b.length, `path ${i}`);
    for (let j = 0; j < a.length; j++)
      assert.ok(
        a[j] === b[j] ||
          (Number.isFinite(Number(a[j])) && Number(a[j]) === Number(b[j])),
        `path ${i} token ${j}`,
      );
  }
  assert.ok(optimized.length < original.length);
});

test("adapter click delegation rejects mismatched DOM identities and retired sessions", async () => {
  const { createCandidateAdapter } =
    await import("../js/world-map-adapter.mjs");
  const manifest = {
    entities: [
      {
        canonical_id: "iso3166-1:CA",
        display_name: "Canada",
        dom_id: "country-CA",
        polygon_parts: 1,
      },
    ],
  };
  let handler,
    session = 1;
  const doc = {
    addEventListener: (type, fn) => {
      handler = fn;
    },
    removeEventListener: () => {},
    contains: () => true,
  };
  const scored = [];
  const adapter = createCandidateAdapter(manifest, ["Canada"], () => session);
  adapter.activate(doc, 1, (name) => scored.push(name));
  const group = {
    id: "country-BR",
    dataset: { canonicalId: "iso3166-1:CA" },
    ownerDocument: doc,
  };
  handler({ target: { closest: () => group } });
  assert.deepEqual(scored, []);
  group.id = "country-CA";
  handler({ target: { closest: () => group } });
  assert.deepEqual(scored, ["Canada"]);
  session = 2;
  handler({ target: { closest: () => group } });
  assert.deepEqual(scored, ["Canada"]);
});

test("adapter retains real pointer-down identity through SVG pointer capture and ignores drags", async () => {
  const { createCandidateAdapter } =
    await import("../js/world-map-adapter.mjs");
  const manifest = {
    entities: [
      {
        canonical_id: "iso3166-1:CA",
        display_name: "Canada",
        dom_id: "country-CA",
      },
    ],
  };
  const handlers = {};
  const doc = {
    addEventListener: (type, fn) => {
      handlers[type] = fn;
    },
    removeEventListener: () => {},
    contains: () => true,
  };
  const group = {
    id: "country-CA",
    dataset: { canonicalId: "iso3166-1:CA" },
    ownerDocument: doc,
  };
  const selected = [];
  const adapter = createCandidateAdapter(manifest, ["Canada"], () => 1);
  adapter.activate(doc, 1, (name) => selected.push(name));
  handlers.pointerdown({
    target: { closest: () => group },
    pointerId: 7,
    clientX: 2,
    clientY: 2,
  });
  handlers.pointerup({
    target: { closest: () => null },
    pointerId: 7,
    clientX: 2,
    clientY: 2,
  });
  assert.deepEqual(selected, ["Canada"]);
  handlers.pointerdown({
    target: { closest: () => group },
    pointerId: 7,
    clientX: 2,
    clientY: 2,
  });
  handlers.pointermove({ pointerId: 7, clientX: 30, clientY: 2 });
  handlers.pointerup({
    target: { closest: () => null },
    pointerId: 7,
    clientX: 30,
    clientY: 2,
  });
  assert.deepEqual(selected, ["Canada"]);
});
