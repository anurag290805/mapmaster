export const PROGRESSION_VERSION = 1;
const MAX_XP = 1_000_000_000;
const MAX_PROCESSED_RESULTS = 100;
const MAX_RECORDS = 200;

export type GameType =
  "typing" | "locate" | "flag" | "capital" | "flagChoice" | "capitalChoice";
export type GameMode = "practice" | "challenge";
export type SessionOutcome = "won" | "lost" | "abandoned";

export interface TerminalSessionResult {
  id: string;
  outcome: SessionOutcome;
  gameType: GameType;
  mapKey: string;
  gameMode: GameMode;
  selectedTime: number | null;
  selectedLives: number | null;
  score: number;
  correctAnswers: number;
  totalAttempts: number;
  bestStreak: number;
  elapsedSeconds: number;
}

export interface PersonalBest {
  highestScore: number;
  highestAccuracy: number;
  fastestWinSeconds: number | null;
}

export interface ProgressState {
  version: typeof PROGRESSION_VERSION;
  totalXp: number;
  processedResultIds: string[];
  achievements: string[];
  records: Record<string, PersonalBest>;
  stats: {
    completedSessions: number;
    wins: number;
    challengeWins: number;
    completedGameTypes: GameType[];
  };
}

export interface Award {
  eligible: boolean;
  duplicate: boolean;
  xp: number;
  accuracy: number;
  unlocked: string[];
}

const GAME_TYPES: readonly GameType[] = [
  "typing",
  "locate",
  "flag",
  "capital",
  "flagChoice",
  "capitalChoice",
];
const ACHIEVEMENTS = new Set([
  "first-finish",
  "timed-finisher",
  "perfect-recall",
  "five-in-a-row",
  "sprint-starter",
  "explorer",
]);

function clampInteger(value: unknown, minimum: number, maximum: number) {
  const number = typeof value === "number" ? value : 0;
  if (!Number.isFinite(number)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.floor(number)));
}

function isGameType(value: unknown): value is GameType {
  return typeof value === "string" && GAME_TYPES.includes(value as GameType);
}

function isGameMode(value: unknown): value is GameMode {
  return value === "practice" || value === "challenge";
}

function isResultEligible(result: TerminalSessionResult) {
  return (
    typeof result.id === "string" &&
    result.id.length > 0 &&
    result.id.length <= 160 &&
    (result.outcome === "won" || result.outcome === "lost") &&
    isGameType(result.gameType) &&
    typeof result.mapKey === "string" &&
    result.mapKey.length > 0 &&
    result.mapKey.length <= 80 &&
    isGameMode(result.gameMode) &&
    Number.isInteger(result.totalAttempts) &&
    result.totalAttempts > 0 &&
    result.totalAttempts <= 10_000 &&
    Number.isInteger(result.correctAnswers) &&
    result.correctAnswers >= 0 &&
    result.correctAnswers <= result.totalAttempts &&
    Number.isInteger(result.score) &&
    result.score >= 0 &&
    result.score <= 10_000 &&
    Number.isInteger(result.bestStreak) &&
    result.bestStreak >= 0 &&
    result.bestStreak <= 10_000 &&
    Number.isInteger(result.elapsedSeconds) &&
    result.elapsedSeconds >= 0 &&
    result.elapsedSeconds <= 86_400
  );
}

function accuracyFor(result: TerminalSessionResult) {
  return Math.round((result.correctAnswers / result.totalAttempts) * 100);
}

function achievementIds(
  result: TerminalSessionResult,
  stats: ProgressState["stats"],
  accuracy: number,
) {
  const ids: string[] = [];
  if (result.outcome === "won") ids.push("first-finish");
  if (result.outcome === "won" && result.gameMode === "challenge")
    ids.push("timed-finisher");
  if (result.outcome === "won" && accuracy === 100) ids.push("perfect-recall");
  if (result.bestStreak >= 5) ids.push("five-in-a-row");
  if (
    result.outcome === "won" &&
    (result.gameType === "flagChoice" || result.gameType === "capitalChoice")
  )
    ids.push("sprint-starter");
  if (stats.completedGameTypes.length >= 3) ids.push("explorer");
  return ids;
}

export function createInitialProgress(): ProgressState {
  return {
    version: PROGRESSION_VERSION,
    totalXp: 0,
    processedResultIds: [],
    achievements: [],
    records: {},
    stats: {
      completedSessions: 0,
      wins: 0,
      challengeWins: 0,
      completedGameTypes: [],
    },
  };
}

export function levelProgress(totalXp: number) {
  const safeXp = clampInteger(totalXp, 0, MAX_XP);
  return {
    level: Math.floor(safeXp / 100) + 1,
    current: safeXp % 100,
    needed: 100,
  };
}

export function recordKey(result: TerminalSessionResult) {
  const time =
    result.gameMode === "challenge" ? result.selectedTime : "practice";
  const lives =
    result.gameType === "locate" ? (result.selectedLives ?? "none") : "none";
  return `${result.gameType}|${result.mapKey}|${result.gameMode}|${time}|${lives}`;
}

export function calculateXp(result: TerminalSessionResult) {
  if (!isResultEligible(result)) return 0;
  const accuracy = accuracyFor(result);
  let xp = result.gameMode === "challenge" ? 30 : 20;
  xp += Math.floor(accuracy / 10) * 2;
  if (
    result.gameMode === "challenge" &&
    (result.selectedTime ?? Infinity) <= 60
  )
    xp += 10;
  if (
    result.gameMode === "challenge" &&
    result.gameType === "locate" &&
    (result.selectedLives ?? Infinity) <= 1
  )
    xp += 5;
  if (result.outcome === "won") xp += 25;
  return clampInteger(xp, 0, 100);
}

export function applyTerminalResult(
  current: ProgressState,
  result: TerminalSessionResult,
): { state: ProgressState; award: Award } {
  const state = migrateProgress(current);
  const accuracy = isResultEligible(result) ? accuracyFor(result) : 0;
  if (!isResultEligible(result)) {
    return {
      state,
      award: {
        eligible: false,
        duplicate: false,
        xp: 0,
        accuracy,
        unlocked: [],
      },
    };
  }
  if (state.processedResultIds.includes(result.id)) {
    return {
      state,
      award: { eligible: true, duplicate: true, xp: 0, accuracy, unlocked: [] },
    };
  }

  const completedGameTypes = state.stats.completedGameTypes.includes(
    result.gameType,
  )
    ? state.stats.completedGameTypes
    : [...state.stats.completedGameTypes, result.gameType];
  const stats = {
    completedSessions: clampInteger(
      state.stats.completedSessions + 1,
      0,
      MAX_XP,
    ),
    wins: clampInteger(
      state.stats.wins + (result.outcome === "won" ? 1 : 0),
      0,
      MAX_XP,
    ),
    challengeWins: clampInteger(
      state.stats.challengeWins +
        (result.outcome === "won" && result.gameMode === "challenge" ? 1 : 0),
      0,
      MAX_XP,
    ),
    completedGameTypes,
  };
  const unlocked = achievementIds(result, stats, accuracy).filter(
    (id) => !state.achievements.includes(id),
  );
  const key = recordKey(result);
  const existing = state.records[key] ?? {
    highestScore: 0,
    highestAccuracy: 0,
    fastestWinSeconds: null,
  };
  const record: PersonalBest = {
    highestScore: Math.max(existing.highestScore, result.score),
    highestAccuracy: Math.max(existing.highestAccuracy, accuracy),
    fastestWinSeconds:
      result.outcome !== "won"
        ? existing.fastestWinSeconds
        : existing.fastestWinSeconds == null
          ? result.elapsedSeconds
          : Math.min(existing.fastestWinSeconds, result.elapsedSeconds),
  };
  const records = { ...state.records, [key]: record };
  const recordEntries = Object.entries(records).slice(-MAX_RECORDS);
  const xp = calculateXp(result);
  return {
    state: {
      version: PROGRESSION_VERSION,
      totalXp: clampInteger(state.totalXp + xp, 0, MAX_XP),
      processedResultIds: [...state.processedResultIds, result.id].slice(
        -MAX_PROCESSED_RESULTS,
      ),
      achievements: [...state.achievements, ...unlocked],
      records: Object.fromEntries(recordEntries),
      stats,
    },
    award: { eligible: true, duplicate: false, xp, accuracy, unlocked },
  };
}

export function migrateProgress(value: unknown): ProgressState {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return createInitialProgress();
  const candidate = value as Partial<ProgressState>;
  if (candidate.version !== PROGRESSION_VERSION) return createInitialProgress();
  const ids = Array.isArray(candidate.processedResultIds)
    ? candidate.processedResultIds
        .filter(
          (id): id is string => typeof id === "string" && id.length <= 160,
        )
        .slice(-MAX_PROCESSED_RESULTS)
    : [];
  const achievements = Array.isArray(candidate.achievements)
    ? candidate.achievements.filter(
        (id): id is string => typeof id === "string" && ACHIEVEMENTS.has(id),
      )
    : [];
  const rawStats: Partial<ProgressState["stats"]> =
    candidate.stats && typeof candidate.stats === "object"
      ? (candidate.stats as Partial<ProgressState["stats"]>)
      : {};
  const rawCompletedGameTypes: unknown[] = Array.isArray(
    rawStats.completedGameTypes,
  )
    ? rawStats.completedGameTypes
    : [];
  const completedGameTypes = rawCompletedGameTypes.filter(isGameType);
  const records = Object.fromEntries(
    Object.entries(candidate.records ?? {})
      .filter(
        ([key, record]) =>
          key.length <= 200 && record && typeof record === "object",
      )
      .slice(-MAX_RECORDS)
      .map(([key, record]) => {
        const value = record as Partial<PersonalBest>;
        return [
          key,
          {
            highestScore: clampInteger(value.highestScore, 0, 10_000),
            highestAccuracy: clampInteger(value.highestAccuracy, 0, 100),
            fastestWinSeconds:
              typeof value.fastestWinSeconds === "number"
                ? clampInteger(value.fastestWinSeconds, 0, 86_400)
                : null,
          },
        ];
      }),
  ) as Record<string, PersonalBest>;
  return {
    version: PROGRESSION_VERSION,
    totalXp: clampInteger(candidate.totalXp, 0, MAX_XP),
    processedResultIds: ids,
    achievements: [...new Set(achievements)],
    records,
    stats: {
      completedSessions: clampInteger(rawStats.completedSessions, 0, MAX_XP),
      wins: clampInteger(rawStats.wins, 0, MAX_XP),
      challengeWins: clampInteger(rawStats.challengeWins, 0, MAX_XP),
      completedGameTypes: [...new Set(completedGameTypes)],
    },
  };
}
