const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function worldIdentityInventory() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(
    `${fs.readFileSync(path.join(root, "js/data.js"), "utf8")}; globalThis.__regions = MAPS.world.regions;`,
    sandbox,
  );
  return [...sandbox.__regions];
}

test("country-fact catalog covers exactly the active 194 map identities", async () => {
  const catalog = await import(path.join(root, "candidate/country-facts/catalog.v1.mjs"));
  const inventory = worldIdentityInventory();
  const validation = catalog.validateCountryFactCatalog({ expectedDisplayNames: inventory });

  assert.equal(inventory.length, 194);
  assert.equal(catalog.COUNTRY_FACT_CATALOG.length, 194);
  assert.equal(validation.valid, true, validation.errors.join("\\n"));
  assert.equal(new Set(catalog.COUNTRY_FACT_CATALOG.map((record) => record.canonical_id)).size, 194);
  assert.ok(catalog.COUNTRY_FACT_CATALOG.every((record) => record.canonical_id.startsWith("mapmaster:country:")));
  assert.ok(catalog.COUNTRY_FACT_CATALOG.every((record) => record.content_hash.startsWith("fnv1a32:")));
});

test("every fact stays source-qualified, founder-pending, and production-blocked", async () => {
  const catalog = await import(path.join(root, "candidate/country-facts/catalog.v1.mjs"));
  for (const record of catalog.COUNTRY_FACT_CATALOG) {
    assert.equal(record.technical_validation, "accepted");
    assert.equal(record.founder_approval, "pending_founder_approval");
    assert.equal(record.gameplay_approval, "not_approved");
    assert.equal(record.production_eligible, false);
    assert.equal(record.development_preview_only, true);
    assert.match(record.source.country_url, /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+#P\d+$/);
    assert.match(record.source.feature_url, /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/);
  }
  assert.equal(catalog.COUNTRY_FACT_APPROVAL_MANIFEST.records.length, 194);
});

test("production code has no import path to the country-fact candidate catalog", () => {
  const productionRoots = ["index.html", "js", "src", "vite.config.mts", "firebase.json"];
  const files = productionRoots.flatMap((entry) => {
    const target = path.join(root, entry);
    if (!fs.existsSync(target)) return [];
    if (fs.statSync(target).isFile()) return [target];
    return fs.readdirSync(target, { recursive: true })
      .map((relative) => path.join(target, relative))
      .filter((file) => fs.statSync(file).isFile());
  });
  for (const file of files) {
    assert.equal(fs.readFileSync(file, "utf8").includes("country-facts/"), false, file);
  }
});
