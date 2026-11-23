export const DAILY_VERSION = 1;
export const DAILY_GENERATOR_VERSION = "daily-v1";
export const DAILY_CONTENT_VERSION = "capitals-v1";
const MAX_COMPLETIONS = 365;
const CLOCK_ROLLBACK_WINDOW_MS = 36 * 60 * 60 * 1000;

export type DailyDifficulty = "easy" | "medium" | "hard";
export type CalendarDayState =
  "completed" | "missed" | "today" | "future" | "unavailable";

export interface DailyConfig {
  questionCount: number;
  timeSeconds: number;
}
export interface DailyChallenge {
  identity: string;
  day: string;
  difficulty: DailyDifficulty;
  seed: number;
  config: DailyConfig;
  questions: string[];
}
export interface DailyCompletion {
  identity: string;
  day: string;
  difficulty: DailyDifficulty;
  completedAt: number;
  score: number;
  accuracy: number;
  elapsedSeconds: number;
  rewardClaimed: boolean;
}
export interface DailyState {
  version: typeof DAILY_VERSION;
  firstSeenDay: string | null;
  lastObservedDay: string | null;
  lastObservedAt: number;
  completions: DailyCompletion[];
}
export interface DailyStats {
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
}

const CONFIG: Record<DailyDifficulty, DailyConfig> = {
  easy: { questionCount: 5, timeSeconds: 180 },
  medium: { questionCount: 8, timeSeconds: 150 },
  hard: { questionCount: 12, timeSeconds: 120 },
};

function validDay(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
  );
}
function dayNumber(day: string) {
  return Math.floor(Date.parse(`${day}T12:00:00Z`) / 86_400_000);
}
function isDifficulty(value: unknown): value is DailyDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}
function clamp(value: unknown, min: number, max: number) {
  const numeric =
    typeof value === "number" && Number.isFinite(value)
      ? Math.floor(value)
      : min;
  return Math.max(min, Math.min(max, numeric));
}

export function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dailyIdentity(day: string, difficulty: DailyDifficulty) {
  return `${DAILY_GENERATOR_VERSION}:${DAILY_CONTENT_VERSION}:${day}:${difficulty}`;
}

function hash(value: string) {
  let h = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
function shuffle<T>(items: readonly T[], seed: number) {
  const result = [...items];
  const next = random(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function buildDailyChallenge(
  day: string,
  difficulty: DailyDifficulty,
  pool: readonly string[],
): DailyChallenge | null {
  if (!validDay(day) || !isDifficulty(difficulty)) return null;
  const unique = [
    ...new Set(
      pool.filter((item) => typeof item === "string" && item.trim().length > 0),
    ),
  ];
  const config = CONFIG[difficulty];
  if (unique.length < Math.max(config.questionCount, 4)) return null;
  const identity = dailyIdentity(day, difficulty);
  const seed = hash(identity);
  return {
    identity,
    day,
    difficulty,
    seed,
    config: { ...config },
    questions: shuffle(unique, seed).slice(0, config.questionCount),
  };
}

export function createInitialDailyState(): DailyState {
  return {
    version: DAILY_VERSION,
    firstSeenDay: null,
    lastObservedDay: null,
    lastObservedAt: 0,
    completions: [],
  };
}

export function migrateDailyState(value: unknown): DailyState {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return createInitialDailyState();
  const candidate = value as Partial<DailyState>;
  if (candidate.version !== DAILY_VERSION) return createInitialDailyState();
  const completions = Array.isArray(candidate.completions)
    ? candidate.completions.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const completion = item as Partial<DailyCompletion>;
        if (
          !validDay(completion.day) ||
          !isDifficulty(completion.difficulty) ||
          typeof completion.identity !== "string" ||
          completion.identity.length > 160
        )
          return [];
        return [
          {
            identity: completion.identity,
            day: completion.day,
            difficulty: completion.difficulty,
            completedAt: clamp(
              completion.completedAt,
              0,
              Number.MAX_SAFE_INTEGER,
            ),
            score: clamp(completion.score, 0, 10000),
            accuracy: clamp(completion.accuracy, 0, 100),
            elapsedSeconds: clamp(completion.elapsedSeconds, 0, 86400),
            rewardClaimed: completion.rewardClaimed === true,
          },
        ];
      })
    : [];
  const deduped = Array.from(
    new Map(
      completions.map((completion) => [completion.identity, completion]),
    ).values(),
  ).slice(-MAX_COMPLETIONS);
  return {
    version: DAILY_VERSION,
    firstSeenDay: validDay(candidate.firstSeenDay)
      ? candidate.firstSeenDay
      : null,
    lastObservedDay: validDay(candidate.lastObservedDay)
      ? candidate.lastObservedDay
      : null,
    lastObservedAt: clamp(candidate.lastObservedAt, 0, Number.MAX_SAFE_INTEGER),
    completions: deduped,
  };
}

export function getDailyStats(state: DailyState, today: string): DailyStats {
  const days = [
    ...new Set(state.completions.map((completion) => completion.day)),
  ].sort();
  let longest = 0,
    run = 0,
    previous: number | null = null;
  for (const day of days) {
    const number = dayNumber(day);
    run = previous !== null && number === previous + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = number;
  }
  const completed = new Set(days);
  let current = completed.has(today) ? 1 : 0;
  let cursor = dayNumber(today) - 1;
  while (
    current &&
    completed.has(new Date(cursor * 86_400_000).toISOString().slice(0, 10))
  ) {
    current += 1;
    cursor -= 1;
  }
  return {
    completedDays: days.length,
    currentStreak: current,
    longestStreak: longest,
  };
}

export function classifyCalendarDay(
  day: string,
  today: string,
  firstSeenDay: string | null,
  completedDays: ReadonlySet<string>,
): CalendarDayState {
  if (!validDay(day) || !validDay(today)) return "unavailable";
  if (dayNumber(day) > dayNumber(today)) return "future";
  if (completedDays.has(day)) return "completed";
  if (day === today) return "today";
  return firstSeenDay && dayNumber(day) >= dayNumber(firstSeenDay)
    ? "missed"
    : "unavailable";
}

export interface CompletionInput {
  identity: string;
  day: string;
  difficulty: DailyDifficulty;
  now: number;
  score: number;
  accuracy: number;
  elapsedSeconds: number;
}
export interface DailyClaim {
  eligible: boolean;
  duplicate: boolean;
  clockSafe: boolean;
}

export function recordDailyCompletion(
  current: DailyState,
  input: CompletionInput,
): { state: DailyState; claim: DailyClaim } {
  const state = migrateDailyState(current);
  if (
    !validDay(input.day) ||
    !isDifficulty(input.difficulty) ||
    input.identity !== dailyIdentity(input.day, input.difficulty)
  )
    return {
      state,
      claim: { eligible: false, duplicate: false, clockSafe: false },
    };
  const rollback =
    state.lastObservedDay &&
    dayNumber(input.day) < dayNumber(state.lastObservedDay) &&
    input.now >= state.lastObservedAt &&
    input.now - state.lastObservedAt < CLOCK_ROLLBACK_WINDOW_MS;
  const duplicate = state.completions.some(
    (completion) =>
      completion.identity === input.identity && completion.rewardClaimed,
  );
  const completion: DailyCompletion = {
    identity: input.identity,
    day: input.day,
    difficulty: input.difficulty,
    completedAt: clamp(input.now, 0, Number.MAX_SAFE_INTEGER),
    score: clamp(input.score, 0, 10000),
    accuracy: clamp(input.accuracy, 0, 100),
    elapsedSeconds: clamp(input.elapsedSeconds, 0, 86400),
    rewardClaimed: !rollback && !duplicate,
  };
  const nextCompletions = [
    ...state.completions.filter((item) => item.identity !== input.identity),
    completion,
  ].slice(-MAX_COMPLETIONS);
  return {
    state: {
      ...state,
      firstSeenDay:
        state.firstSeenDay &&
        dayNumber(state.firstSeenDay) <= dayNumber(input.day)
          ? state.firstSeenDay
          : input.day,
      lastObservedDay:
        !state.lastObservedDay ||
        dayNumber(input.day) >= dayNumber(state.lastObservedDay)
          ? input.day
          : state.lastObservedDay,
      lastObservedAt: Math.max(state.lastObservedAt, input.now),
      completions: nextCompletions,
    },
    claim: {
      eligible: completion.rewardClaimed,
      duplicate,
      clockSafe: !rollback,
    },
  };
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
export function buildShareText(result: {
  day: string;
  difficulty: DailyDifficulty;
  score: number;
  total: number;
  accuracy: number;
  elapsedSeconds: number;
  currentStreak: number;
}) {
  const [year, month, date] = result.day.split("-").map(Number);
  const label = `${date} ${new Date(Date.UTC(year, month - 1, date)).toLocaleString("en", { month: "short", timeZone: "UTC" })} ${year}`;
  return `MapMaster Daily · ${label} · ${result.difficulty[0].toUpperCase()}${result.difficulty.slice(1)}\n${result.score}/${result.total} correct · ${result.accuracy}% · ${formatTime(result.elapsedSeconds)}\n🔥 ${result.currentStreak}-day streak`;
}
