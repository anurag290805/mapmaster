import { describe, expect, it } from "vitest";
import {
  buildDailyChallenge,
  buildShareText,
  classifyCalendarDay,
  createInitialDailyState,
  dailyIdentity,
  dayKey,
  getDailyStats,
  migrateDailyState,
  recordDailyCompletion,
} from "../../src/shared/daily";

const capitals = [
  "Accra",
  "Athens",
  "Berlin",
  "Brasília",
  "Cairo",
  "Canberra",
  "Dhaka",
  "Hanoi",
  "Lima",
  "Lisbon",
  "London",
  "Madrid",
  "Nairobi",
  "Ottawa",
  "Paris",
  "Quito",
  "Rome",
  "Seoul",
  "Tokyo",
  "Vienna",
];

describe("CP10 daily domain rules", () => {
  it("creates a versioned stable daily identity and question order", () => {
    const first = buildDailyChallenge("2026-11-03", "medium", capitals);
    const second = buildDailyChallenge("2026-11-03", "medium", capitals);
    const other = buildDailyChallenge("2026-11-04", "medium", capitals);
    expect(first).toEqual(second);
    expect(first?.identity).toBe(dailyIdentity("2026-11-03", "medium"));
    expect(first?.questions).toHaveLength(8);
    expect(first?.questions).not.toEqual(other?.questions);
    expect(new Set(first?.questions).size).toBe(8);
  });

  it("uses distinctly validated difficulty parameters and fails closed for short pools", () => {
    const easy = buildDailyChallenge("2026-11-03", "easy", capitals);
    const hard = buildDailyChallenge("2026-11-03", "hard", capitals);
    expect(easy?.config).toEqual({ questionCount: 5, timeSeconds: 180 });
    expect(hard?.config).toEqual({ questionCount: 12, timeSeconds: 120 });
    expect(
      buildDailyChallenge("2026-11-03", "hard", capitals.slice(0, 11)),
    ).toBeNull();
  });

  it("tracks completed days, current and longest streaks across midnight", () => {
    let state = createInitialDailyState();
    for (const day of [
      "2026-10-30",
      "2026-10-31",
      "2026-11-02",
      "2026-11-03",
    ]) {
      state = recordDailyCompletion(state, {
        identity: dailyIdentity(day, "easy"),
        day,
        difficulty: "easy",
        now: 1000,
        score: 5,
        accuracy: 100,
        elapsedSeconds: 42,
      }).state;
    }
    expect(getDailyStats(state, "2026-11-03")).toMatchObject({
      completedDays: 4,
      currentStreak: 2,
      longestStreak: 2,
    });
    expect(getDailyStats(state, "2026-11-04").currentStreak).toBe(0);
  });

  it("classifies completed, missed, today, and future calendar dates", () => {
    const completed = new Set(["2026-11-01"]);
    expect(
      classifyCalendarDay("2026-11-01", "2026-11-03", "2026-10-30", completed),
    ).toBe("completed");
    expect(
      classifyCalendarDay("2026-11-02", "2026-11-03", "2026-10-30", completed),
    ).toBe("missed");
    expect(
      classifyCalendarDay("2026-11-03", "2026-11-03", "2026-10-30", completed),
    ).toBe("today");
    expect(
      classifyCalendarDay("2026-11-04", "2026-11-03", "2026-10-30", completed),
    ).toBe("future");
  });

  it("allows only the first eligible completion identity and guards a short clock rollback", () => {
    const first = recordDailyCompletion(createInitialDailyState(), {
      identity: dailyIdentity("2026-11-03", "hard"),
      day: "2026-11-03",
      difficulty: "hard",
      now: 1_000_000,
      score: 12,
      accuracy: 100,
      elapsedSeconds: 80,
    });
    expect(first.claim).toMatchObject({
      eligible: true,
      duplicate: false,
      clockSafe: true,
    });
    const replay = recordDailyCompletion(first.state, {
      identity: dailyIdentity("2026-11-03", "hard"),
      day: "2026-11-03",
      difficulty: "hard",
      now: 1_001_000,
      score: 12,
      accuracy: 100,
      elapsedSeconds: 70,
    });
    expect(replay.claim).toMatchObject({ eligible: false, duplicate: true });
    const rollback = recordDailyCompletion(first.state, {
      identity: dailyIdentity("2026-11-02", "easy"),
      day: "2026-11-02",
      difficulty: "easy",
      now: 1_002_000,
      score: 5,
      accuracy: 100,
      elapsedSeconds: 30,
    });
    expect(rollback.claim).toMatchObject({ eligible: false, clockSafe: false });
  });

  it("migrates bounded valid state, recovers corruption, and produces spoiler-free share text", () => {
    expect(migrateDailyState("corrupt")).toEqual(createInitialDailyState());
    expect(migrateDailyState({ version: 99 })).toEqual(
      createInitialDailyState(),
    );
    expect(dayKey(new Date(2026, 10, 3, 23, 59))).toBe("2026-11-03");
    expect(
      buildShareText({
        day: "2026-11-03",
        difficulty: "hard",
        score: 9,
        total: 12,
        accuracy: 75,
        elapsedSeconds: 83,
        currentStreak: 4,
      }),
    ).toBe(
      "MapMaster Daily · 3 Nov 2026 · Hard\n9/12 correct · 75% · 1:23\n🔥 4-day streak",
    );
  });
});
