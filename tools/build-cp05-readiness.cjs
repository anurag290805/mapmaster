#!/usr/bin/env node
'use strict';

/*
 * CP05 readiness is deliberately a report of evidence, not an approval tool.
 * In particular, a reconciled registry entry is only AUTOMATED_ONLY unless an
 * independent identity, boundary, policy, and interaction approval exists.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const GEO = path.join(ROOT, 'docs/engineering');
const CATEGORY_KEYS = [
  'VERIFIED',
  'AUTOMATED_ONLY',
  'AMBIGUOUS',
  'POLICY_DEPENDENT',
  'BLOCKED',
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function emptyCategories() {
  return Object.fromEntries(CATEGORY_KEYS.map((key) => [key, 0]));
}

function increment(categories, category) {
  if (!Object.hasOwn(categories, category)) {
    throw new Error(`Unknown readiness category: ${category}`);
  }
  categories[category] += 1;
}

function registryCategory(entity) {
  if (!entity) return 'BLOCKED';
  if (entity.status === 'reconciled') return 'AUTOMATED_ONLY';
  if (entity.status === 'ambiguous') return 'AMBIGUOUS';
  if (entity.status === 'policy-dependent') return 'POLICY_DEPENDENT';
  throw new Error(`Unknown registry status for ${entity.entity_id}: ${entity.status}`);
}

function worldCategory(question, registryEntity) {
  // A malformed/invalid source geometry is never approved merely because the
  // candidate SVG has a repaired rendering representation.
  if (!question.geometry?.present || !question.geometry?.valid) return 'BLOCKED';
  // The registry retains the cross-scale discrepancy disposition. Coverage
  // evidence supplements it, but is not allowed to silently promote it.
  if (registryEntity.status === 'ambiguous') return 'AMBIGUOUS';
  if (registryEntity.status === 'policy-dependent' || question.policy?.watchlist) {
    return 'POLICY_DEPENDENT';
  }
  assert(registryEntity.status === 'reconciled',
    `unexpected world registry status for ${question.question_key}`);
  // Coverage is currently source-valid or pilot-checked, not independent
  // feature approval. Do not emit VERIFIED without an explicit future gate.
  return 'AUTOMATED_ONLY';
}

function countCandidateMatches(question) {
  return Object.values(question.candidate_features_by_layer || {})
    .reduce((total, candidates) => total + candidates.length, 0);
}

function assert(condition, message) {
  if (!condition) throw new Error(`CP05 readiness input mismatch: ${message}`);
}

function buildReadiness() {
  const registry = readJson('docs/engineering/CP05_GEO_REGISTRY.json');
  const coverage = readJson('docs/engineering/CP05_WORLD_COVERAGE.json');
  const requirements = readJson('docs/engineering/CP05_GEO_REQUIREMENTS.json');
  const feasibility = readJson('docs/engineering/CP05_GEO_FEASIBILITY.json');
  const manifest = readJson('candidate/world-manifest.json');

  const entityByQuestion = new Map();
  for (const entity of registry.entities) {
    for (const occurrence of entity.occurrences) {
      assert(!entityByQuestion.has(occurrence.question_key),
        `duplicate registry occurrence ${occurrence.question_key}`);
      entityByQuestion.set(occurrence.question_key, entity);
    }
  }
  assert(entityByQuestion.size === registry.expected_occurrences.length,
    'registry occurrence count differs from expected occurrences');

  const coverageByQuestion = new Map(coverage.questions.map((question) => [question.question_key, question]));
  const manifestByQuestion = new Map(manifest.entities.map((entity) => [entity.question_key, entity]));
  const worldRequirements = requirements.scopes.find((scope) => scope.scope === 'world');
  assert(worldRequirements, 'world requirements scope is absent');
  assert(coverage.questions.length === 194, 'world coverage is not 194 targets');
  assert(worldRequirements.questions.length === coverage.questions.length,
    'world requirements and coverage counts differ');
  assert(manifest.entities.length === coverage.questions.length,
    'world manifest and coverage counts differ');

  const worldCategories = emptyCategories();
  const blocked = [];
  const ambiguous = [];
  const policyDependent = [];
  let multipart = 0;
  let sourceInvalid = 0;
  let sourceInvalidBeforeRepair = 0;
  let sourceRepaired = 0;
  let positiveAreaOverlapPairs = 0;

  for (const required of worldRequirements.questions) {
    const question = coverageByQuestion.get(required.question_key);
    const candidate = manifestByQuestion.get(required.question_key);
    const registryEntity = entityByQuestion.get(required.question_key);
    assert(question, `coverage lacks ${required.question_key}`);
    assert(candidate, `candidate manifest lacks ${required.question_key}`);
    assert(registryEntity, `registry lacks ${required.question_key}`);
    assert(question.canonical_id === candidate.canonical_id,
      `canonical ID mismatch for ${required.question_key}`);
    assert(question.canonical_id === registryEntity.entity_id,
      `registry canonical ID mismatch for ${required.question_key}`);
    assert(question.source_feature_id === candidate.source_feature_id,
      `source feature mismatch for ${required.question_key}`);
    assert(question.geometry?.polygon_parts === candidate.polygon_parts,
      `multipart count mismatch for ${required.question_key}`);

    const category = worldCategory(question, registryEntity);
    increment(worldCategories, category);
    if (question.geometry.polygon_parts > 1) multipart += 1;
    if (!question.geometry.valid) sourceInvalid += 1;
    if (question.geometry.source_valid === false) sourceInvalidBeforeRepair += 1;
    if (question.geometry.repair) sourceRepaired += 1;
    positiveAreaOverlapPairs += question.geometry.overlaps.length;

    const record = {
      question_key: question.question_key,
      display_name: question.display_name,
      reason: question.blockers,
    };
    if (category === 'BLOCKED') blocked.push(record);
    if (category === 'AMBIGUOUS') ambiguous.push(record);
    if (category === 'POLICY_DEPENDENT') policyDependent.push(record);
  }

  const canonicalIds = coverage.questions.map((question) => question.canonical_id);
  const featureIds = coverage.questions.map((question) => question.source_feature_id);
  const domIds = manifest.entities.map((entity) => entity.dom_id);
  const contextFeatureIds = manifest.noninteractive_source_context
    .map((feature) => feature.source_feature_id);
  assert(new Set(canonicalIds).size === coverage.questions.length, 'duplicate world canonical IDs');
  assert(new Set(featureIds).size === coverage.questions.length, 'duplicate world source feature IDs');
  assert(new Set(domIds).size === manifest.entities.length, 'duplicate world candidate DOM IDs');
  assert(new Set(contextFeatureIds).size === contextFeatureIds.length,
    'duplicate noninteractive source-context feature IDs');
  assert(!contextFeatureIds.some((id) => featureIds.includes(id)),
    'a noninteractive source-context feature is assigned to a country target');

  const scopeByName = new Map(requirements.scopes.map((scope) => [scope.scope, scope]));
  const feasibilityByScope = new Map(feasibility.scope_feasibility.map((scope) => [scope.scope, scope]));
  const regionalScopes = [];
  const regionalCategories = emptyCategories();
  let noCandidateDiscovery = 0;
  let multipleCandidateDiscovery = 0;

  for (const scope of requirements.scopes.filter((entry) => entry.scope !== 'world')) {
    const categories = emptyCategories();
    const source = feasibilityByScope.get(scope.scope);
    assert(source, `feasibility lacks ${scope.scope}`);
    assert(source.questions.length === scope.questions.length,
      `feasibility count differs for ${scope.scope}`);

    for (const question of scope.questions) {
      const entity = entityByQuestion.get(question.question_key);
      const category = registryCategory(entity);
      increment(categories, category);
      increment(regionalCategories, category);
    }

    if (scope.declared_scope === 'country_subdivisions' && scope.scope !== 'india') {
      for (const question of source.questions) {
        const matchCount = countCandidateMatches(question);
        if (matchCount === 0) noCandidateDiscovery += 1;
        if (matchCount > 1) multipleCandidateDiscovery += 1;
      }
    }

    regionalScopes.push({
      scope: scope.scope,
      declared_scope: scope.declared_scope,
      total: scope.questions.length,
      categories,
      ready: false,
    });
  }

  const india = scopeByName.get('india');
  const indiaBonus = requirements.india_bonus_union_territories;
  const indiaCategories = emptyCategories();
  for (const question of [...india.questions, ...indiaBonus]) {
    increment(indiaCategories, registryCategory(entityByQuestion.get(question.question_key)));
  }
  const indiaSourcePairs = registry.entities.filter((entity) => entity.parent === 'india');
  const indiaSource = feasibility.geoboundaries_india;
  assert(indiaSourcePairs.length === india.questions.length + indiaBonus.length,
    'India source-pair count differs from configured state and UT records');
  assert(indiaSource.feature_count === indiaSourcePairs.length,
    'pinned geoBoundaries feature count differs from India source pairs');

  return {
    schema_version: '1.0.0',
    purpose: 'CP05 conservative geographic and regional-map readiness; not gameplay approval',
    categories: {
      VERIFIED: 'independently approved identity, geometry, policy, and interaction evidence',
      AUTOMATED_ONLY: 'deterministically correlated or source-valid evidence only',
      AMBIGUOUS: 'identity, scope, or source association remains unresolved',
      POLICY_DEPENDENT: 'requires boundary, administrative, or publication-policy approval',
      BLOCKED: 'known invalid/missing geometry or a hard validation failure',
    },
    evidence: {
      registry: 'docs/engineering/CP05_GEO_REGISTRY.json',
      world_coverage: 'docs/engineering/CP05_WORLD_COVERAGE.json',
      requirements: 'docs/engineering/CP05_GEO_REQUIREMENTS.json',
      feasibility: 'docs/engineering/CP05_GEO_FEASIBILITY.json',
      candidate_manifest: 'candidate/world-manifest.json',
    },
    world: {
      total: coverage.questions.length,
      categories: worldCategories,
      live_eligible: coverage.questions.filter((question) => question.gates?.live_eligible).length,
      canonical_ids_unique: true,
      source_feature_ids_unique: true,
      candidate_dom_ids_unique: true,
      candidate_geometry_ids_unique: true,
      noninteractive_context_features: {
        total: contextFeatureIds.length,
        source_feature_ids_unique: true,
        distinct_from_country_targets: true,
      },
      source_invalid: sourceInvalid,
      source_invalid_before_repair: sourceInvalidBeforeRepair,
      source_repaired: sourceRepaired,
      multipart,
      positive_area_overlap_pairs: positiveAreaOverlapPairs / 2,
      blocked,
      ambiguous,
      policy_dependent: policyDependent,
    },
    regional: {
      total: regionalScopes.reduce((total, scope) => total + scope.total, 0),
      categories: regionalCategories,
      scopes: regionalScopes,
      india: {
        locate_questions: india.questions.length,
        typing_bonus_questions: indiaBonus.length,
        categories: indiaCategories,
        ready: false,
        source_evidence: {
          pinned_geoboundaries_feature_count: indiaSource.feature_count,
          pinned_geoboundaries_boundary_id: indiaSource.metadata_boundary_id,
          pinned_geoboundaries_reported_year: indiaSource.represented_year_as_reported,
          configured_states: india.questions.length,
          configured_union_territory_typing_bonuses: indiaBonus.length,
          source_pairs: indiaSourcePairs.length,
        },
        findings: [
          'The reported 2011 geoBoundaries India ADM1 source contains Ladakh and merged Dadra and Nagar Haveli and Daman and Diu.',
          'Natural Earth Admin-1 classifies Himachal Pradesh as a Union Territory, conflicting with the configured state list.',
          'Shared source codes are candidate discovery evidence, not approved subnational geometry associations.',
        ],
        policy_decisions_required: [
          {
            id: 'india-effective-boundary-date',
            decision: 'Approve the effective date and accountable source for an India ADM1 layer.',
            evidence: 'The pinned geoBoundaries layer reports 2011 but contains Ladakh and the merged Dadra and Nagar Haveli and Daman and Diu, which post-date that year.',
            safe_default: 'Do not use the pinned layer as a current or historic approved boundary authority.',
          },
          {
            id: 'india-jammu-kashmir-ladakh-boundary-policy',
            decision: 'Approve the product boundary presentation for Jammu and Kashmir and Ladakh, including any alternate-view handling.',
            evidence: 'The pinned source includes Jammu and Kashmir and Ladakh; this decision cannot be settled by a source code or geometry repair.',
            safe_default: 'Keep all India source pairs policy-dependent and the candidate development-only.',
          },
          {
            id: 'india-source-license-and-attribution',
            decision: 'Approve the license/provenance notice required for the original India source and geoBoundaries redistribution path.',
            evidence: 'Pinned metadata reports CC BY 2.5 India and geoBoundaries requires attribution for API/tool use.',
            safe_default: 'Do not redistribute or activate the source-derived India layer.',
          },
          {
            id: 'india-locate-versus-typing-scope',
            decision: 'Confirm the intended gameplay scope after a compatible boundary source is selected: 28 states for locate and eight Union Territories as typing bonuses only.',
            evidence: 'The configured game and pinned layer both total 36 State / Union Territory entities, but source membership does not authorize gameplay scope changes.',
            safe_default: 'Preserve the current 28/8 split and do not add Union Territories to locate mode.',
          },
        ],
      },
      subnational: {
        no_candidate_discovery: noCandidateDiscovery,
        multiple_candidate_discovery: multipleCandidateDiscovery,
        administrative_level_mismatches: [
          'France configured regions versus Natural Earth department-level candidates',
          'Italy configured regions versus Natural Earth province-level candidates',
          'India Himachal Pradesh configured state versus Natural Earth Union Territory classification',
        ],
      },
    },
    approval_required: [
      'Feature-level boundary and country/context association review, including all 22 world policy-watchlist targets.',
      'Publication boundary policy for disputed or sensitive territories, alternate views, and regional-map treatment.',
      'India ADM1 effective-date, administrative classification, and boundary approval before source-pair mapping.',
      'Provenance and attribution approval for inherited SVG assets and geoBoundaries India source terms.',
      'Interaction review for multipart and small targets, including source-invalid Egypt after any repair decision.',
    ],
    release: {
      ready: false,
      blockers: [
        'No world target has independent feature approval; all candidate entries remain development-only.',
        'Egypt source geometry is invalid and has no independent repair/boundary approval.',
        'Regional and subnational maps lack separately verified datasets and approved administrative-level mappings.',
      ],
    },
  };
}

if (require.main === module) {
  const report = buildReadiness();
  const output = path.join(GEO, 'CP05_READINESS.json');
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`Wrote ${path.relative(ROOT, output)}\n`);
}

module.exports = { buildReadiness };
