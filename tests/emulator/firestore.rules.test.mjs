import { readFile } from "node:fs/promises";
import test from "node:test";

const host = process.env.FIRESTORE_EMULATOR_HOST;
test("Firestore rules isolate player saves and reject malformed documents", { skip: !host && "Set FIRESTORE_EMULATOR_HOST and install @firebase/rules-unit-testing to run against the Local Emulator Suite." }, async () => {
  let rules;
  try { rules = await import("@firebase/rules-unit-testing"); } catch { test.skip("Install @firebase/rules-unit-testing to run rule integration tests."); return; }
  const projectId = process.env.GCLOUD_PROJECT ?? `mapmaster-rules-${Date.now()}`;
  const [hostname, port] = host.split(":");
  const env = await rules.initializeTestEnvironment({ projectId, firestore: { host: hostname, port: Number(port), rules: await readFile("firestore.rules", "utf8") } });
  const valid = { schemaVersion: 1, updatedAt: 1, progress: { version: 1, totalXp: 0, processedResultIds: [], achievements: [], records: {}, stats: { completedSessions: 0, wins: 0, challengeWins: 0, completedGameTypes: [] } }, daily: { version: 1, firstSeenDay: null, lastObservedDay: null, lastObservedAt: 0, completions: [] }, settings: { displayName: "Explorer", theme: "system", soundEnabled: true, reducedMotion: false } };
  await rules.assertSucceeds(env.authenticatedContext("player-a").firestore().doc("players/player-a").set(valid));
  await rules.assertSucceeds(env.authenticatedContext("player-a").firestore().doc("players/player-a").update({ updatedAt: 2 }));
  await rules.assertFails(env.authenticatedContext("player-b").firestore().doc("players/player-a").get());
  await rules.assertFails(env.authenticatedContext("player-b").firestore().doc("players/player-a").update({ updatedAt: 3 }));
  await rules.assertFails(env.authenticatedContext("player-b").firestore().doc("players/player-a").delete());
  await rules.assertFails(env.unauthenticatedContext().firestore().doc("players/player-a").get());
  await rules.assertFails(env.authenticatedContext("player-a").firestore().doc("players/player-a").set({ ...valid, unexpected: true }));
  await rules.assertFails(env.authenticatedContext("player-a").firestore().doc("players/player-a").set({ ...valid, schemaVersion: 2 }));
  await rules.assertFails(env.authenticatedContext("player-a").firestore().doc("players/player-a").set({ ...valid, progress: { ...valid.progress, processedResultIds: Array.from({ length: 101 }, (_, i) => String(i)) } }));
  await rules.assertFails(env.authenticatedContext("player-a").firestore().doc("players/player-a").set({ ...valid, progress: { ...valid.progress, stats: { invalid: true } } }));
  await rules.assertSucceeds(env.authenticatedContext("player-a").firestore().doc("players/player-a").delete());
  await env.cleanup();
});

test("Firestore rules validate populated CP08/CP10 saves and nested entries", { skip: !host && "Set FIRESTORE_EMULATOR_HOST to run against the Local Emulator Suite." }, async () => {
  const rules = await import("@firebase/rules-unit-testing");
  const projectId = process.env.GCLOUD_PROJECT ?? `mapmaster-rules-${Date.now()}`;
  const [hostname, port] = host.split(":");
  const env = await rules.initializeTestEnvironment({ projectId, firestore: { host: hostname, port: Number(port), rules: await readFile("firestore.rules", "utf8") } });
  const db = env.authenticatedContext("nested-owner").firestore();
  const ref = db.doc("players/nested-owner");
  const valid = {
    schemaVersion: 1,
    updatedAt: 1762128000000,
    progress: {
      version: 1,
      totalXp: 125,
      processedResultIds: ["typing:round-1"],
      achievements: ["first-finish", "timed-finisher"],
      records: { typing: { highestScore: 100, highestAccuracy: 98, fastestWinSeconds: 12 } },
      stats: { completedSessions: 2, wins: 2, challengeWins: 1, completedGameTypes: ["typing", "locate"] },
    },
    daily: {
      version: 1,
      firstSeenDay: "2026-11-03",
      lastObservedDay: "2026-11-03",
      lastObservedAt: 1762128000000,
      completions: [{ identity: "daily-v1:capitals-v1:2026-11-03:easy", day: "2026-11-03", difficulty: "easy", completedAt: 1762128000000, score: 100, accuracy: 98, elapsedSeconds: 12, rewardClaimed: true }],
    },
    settings: { displayName: "Explorer", theme: "system", soundEnabled: true, reducedMotion: false },
  };
  try {
    await rules.assertSucceeds(ref.set(valid));
    await rules.assertFails(ref.set({ ...valid, progress: { ...valid.progress, achievements: ["first-finish", "not-an-achievement"] } }));
    await rules.assertFails(ref.set({ ...valid, daily: { ...valid.daily, firstSeenDay: "not-a-day" } }));
    await rules.assertFails(ref.set({ ...valid, progress: { ...valid.progress, totalXp: 12.5 } }));
    await rules.assertFails(ref.set({ ...valid, updatedAt: 9007199254740992 }));
    await rules.assertFails(ref.set({ ...valid, progress: { ...valid.progress, stats: { ...valid.progress.stats, wins: "two" } } }));
    await rules.assertFails(ref.set({ ...valid, progress: { ...valid.progress, records: Object.fromEntries(Array.from({ length: 201 }, (_, index) => [`record-${index}`, {}])) } }));
    await rules.assertFails(ref.set({ ...valid, daily: { ...valid.daily, completions: Array.from({ length: 366 }, () => valid.daily.completions[0]) } }));
    await rules.assertFails(ref.set({ ...valid, settings: { ...valid.settings, extra: true } }));
  } finally {
    await env.cleanup();
  }
});
