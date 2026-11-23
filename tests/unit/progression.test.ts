import { describe, expect, it } from "vitest";
import {
  applyTerminalResult,
  createInitialProgress,
  levelProgress,
  migrateProgress,
  type TerminalSessionResult,
} from "../../src/shared/progression";

function result(
  overrides: Partial<TerminalSessionResult> = {},
): TerminalSessionResult {
  return {
    id: "session-1",
    outcome: "won",
    gameType: "typing",
    mapKey: "world",
    gameMode: "practice",
    selectedTime: null,
    selectedLives: null,
    score: 8,
    correctAnswers: 8,
    totalAttempts: 8,
    bestStreak: 8,
    elapsedSeconds: 40,
    ...overrides,
  };
}

describe("progression rules", () => {
  it("awards deterministic practice and challenge XP from a terminal result", () => {
    const practice = applyTerminalResult(createInitialProgress(), result());
    expect(practice.award).toMatchObject({ xp: 65, eligible: true });

    const challenge = applyTerminalResult(
      createInitialProgress(),
      result({
        id: "session-2",
        gameMode: "challenge",
        selectedTime: 60,
        score: 6,
        correctAnswers: 6,
        totalAttempts: 8,
        bestStreak: 3,
      }),
    );
    expect(challenge.award).toMatchObject({ xp: 79, eligible: true });
  });

  it("rejects abandoned and zero-attempt terminal payloads without XP", () => {
    for (const invalid of [
      result({ id: "abandoned", outcome: "abandoned" }),
      result({
        id: "empty",
        outcome: "lost",
        score: 0,
        correctAnswers: 0,
        totalAttempts: 0,
      }),
    ]) {
      const applied = applyTerminalResult(createInitialProgress(), invalid);
      expect(applied.award).toMatchObject({ xp: 0, eligible: false });
      expect(applied.state.totalXp).toBe(0);
    }
  });

  it("is idempotent for a repeated terminal result", () => {
    const first = applyTerminalResult(createInitialProgress(), result());
    const duplicate = applyTerminalResult(first.state, result());
    expect(duplicate.award).toMatchObject({ duplicate: true, xp: 0 });
    expect(duplicate.state).toEqual(first.state);
  });

  it("unlocks deterministic achievements and advances levels", () => {
    const first = applyTerminalResult(createInitialProgress(), result());
    expect(first.state.achievements).toEqual(
      expect.arrayContaining([
        "first-finish",
        "perfect-recall",
        "five-in-a-row",
      ]),
    );
    expect(levelProgress(100)).toEqual({ level: 2, current: 0, needed: 100 });

    const sprint = applyTerminalResult(
      first.state,
      result({
        id: "sprint",
        gameType: "flagChoice",
        gameMode: "challenge",
        selectedTime: 60,
      }),
    );
    expect(sprint.state.achievements).toEqual(
      expect.arrayContaining(["timed-finisher", "sprint-starter"]),
    );
  });

  it("supports every completed gameplay mode without sharing result IDs", () => {
    const gameTypes: TerminalSessionResult["gameType"][] = [
      "typing",
      "locate",
      "flag",
      "capital",
      "flagChoice",
      "capitalChoice",
    ];
    const state = gameTypes.reduce(
      (progress, gameType, index) =>
        applyTerminalResult(
          progress,
          result({
            id: `mode-${gameType}`,
            gameType,
            selectedLives: gameType === "locate" ? 1 : null,
            gameMode: index % 2 ? "challenge" : "practice",
            selectedTime: index % 2 ? 60 : null,
          }),
        ).state,
      createInitialProgress(),
    );
    expect(state.stats.completedSessions).toBe(gameTypes.length);
    expect(state.stats.completedGameTypes).toEqual(
      expect.arrayContaining(gameTypes),
    );
  });

  it("partitions personal bests by compatible settings and keeps the fastest win", () => {
    const first = applyTerminalResult(
      createInitialProgress(),
      result({ elapsedSeconds: 45 }),
    );
    const better = applyTerminalResult(
      first.state,
      result({
        id: "faster",
        score: 9,
        correctAnswers: 9,
        totalAttempts: 10,
        elapsedSeconds: 30,
      }),
    );
    const differentMode = applyTerminalResult(
      better.state,
      result({
        id: "timed",
        gameMode: "challenge",
        selectedTime: 60,
        elapsedSeconds: 20,
      }),
    );
    expect(Object.keys(differentMode.state.records)).toHaveLength(2);
    expect(
      differentMode.state.records["typing|world|practice|practice|none"],
    ).toMatchObject({ highestScore: 9, fastestWinSeconds: 30 });
  });

  it("migrates valid v1 data and fails closed for corrupt or future data", () => {
    const valid = migrateProgress({ ...createInitialProgress(), totalXp: 125 });
    expect(valid.totalXp).toBe(125);
    expect(migrateProgress("not json")).toEqual(createInitialProgress());
    expect(migrateProgress({ version: 99, totalXp: 999 })).toEqual(
      createInitialProgress(),
    );
  });
});
