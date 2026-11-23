import { describe, expect, it } from "vitest";
import {
  createInitialDailyState,
  dailyIdentity,
  recordDailyCompletion,
} from "../../src/shared/daily";
import { createInitialProgress } from "../../src/shared/progression";
import {
  createCloudSave,
  mergeCloudSaves,
  sanitizeCloudSave,
} from "../../src/shared/cloud-save";

describe("cloud save conflict policy", () => {
  it("unions achievements and retains independent personal bests without summing XP", () => {
    const local = createCloudSave({
      progress: {
        ...createInitialProgress(),
        totalXp: 125,
        achievements: ["first-finish"],
        records: {
          "typing|india|practice|practice|none": {
            highestScore: 8,
            highestAccuracy: 80,
            fastestWinSeconds: 40,
          },
        },
      },
    });
    const cloud = createCloudSave({
      progress: {
        ...createInitialProgress(),
        totalXp: 100,
        achievements: ["perfect-recall"],
        records: {
          "typing|india|practice|practice|none": {
            highestScore: 6,
            highestAccuracy: 100,
            fastestWinSeconds: 35,
          },
        },
      },
    });

    const merged = mergeCloudSaves(local, cloud);
    expect(merged.progress.totalXp).toBe(125);
    expect(merged.progress.achievements).toEqual([
      "first-finish",
      "perfect-recall",
    ]);
    expect(
      merged.progress.records["typing|india|practice|practice|none"],
    ).toEqual({
      highestScore: 8,
      highestAccuracy: 100,
      fastestWinSeconds: 35,
    });
  });

  it("deduplicates a daily reward identity while retaining the stronger valid completion", () => {
    const identity = dailyIdentity("2026-11-03", "easy");
    const localDaily = recordDailyCompletion(createInitialDailyState(), {
      identity,
      day: "2026-11-03",
      difficulty: "easy",
      now: 100,
      score: 3,
      accuracy: 60,
      elapsedSeconds: 80,
    }).state;
    const cloudDaily = recordDailyCompletion(createInitialDailyState(), {
      identity,
      day: "2026-11-03",
      difficulty: "easy",
      now: 120,
      score: 5,
      accuracy: 100,
      elapsedSeconds: 50,
    }).state;
    const merged = mergeCloudSaves(
      createCloudSave({ daily: localDaily }),
      createCloudSave({ daily: cloudDaily }),
    );
    expect(merged.daily.completions).toHaveLength(1);
    expect(merged.daily.completions[0]).toMatchObject({
      identity,
      score: 5,
      rewardClaimed: true,
    });
  });

  it("falls back to a fresh bounded save for malformed cloud payloads", () => {
    const safe = sanitizeCloudSave({
      schemaVersion: 99,
      progress: { totalXp: "not-a-number" },
    });
    expect(safe.progress.totalXp).toBe(0);
    expect(safe.daily.completions).toEqual([]);
  });
});
