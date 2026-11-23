import {
  createInitialDailyState,
  migrateDailyState,
  type DailyCompletion,
  type DailyState,
} from "./daily";
import {
  createInitialProgress,
  migrateProgress,
  type PersonalBest,
  type ProgressState,
} from "./progression";

export const CLOUD_SAVE_SCHEMA_VERSION = 1;
export const MAX_CLOUD_SAVE_BYTES = 200_000;

export interface PlayerSettings {
  displayName: string;
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface CloudSaveV1 {
  schemaVersion: typeof CLOUD_SAVE_SCHEMA_VERSION;
  updatedAt: number;
  progress: ProgressState;
  daily: DailyState;
  settings: PlayerSettings;
}

export interface CloudSaveInput {
  updatedAt?: number;
  progress?: unknown;
  daily?: unknown;
  settings?: Partial<PlayerSettings>;
}

const DEFAULT_SETTINGS: PlayerSettings = {
  displayName: "",
  theme: "system",
  soundEnabled: true,
  reducedMotion: false,
};

function boundedNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)))
    : fallback;
}

function sanitizeSettings(value: unknown): PlayerSettings {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<PlayerSettings>)
      : {};
  return {
    displayName:
      typeof candidate.displayName === "string"
        ? candidate.displayName.trim().slice(0, 48)
        : "",
    theme:
      candidate.theme === "light" ||
      candidate.theme === "dark" ||
      candidate.theme === "system"
        ? candidate.theme
        : DEFAULT_SETTINGS.theme,
    soundEnabled:
      typeof candidate.soundEnabled === "boolean"
        ? candidate.soundEnabled
        : DEFAULT_SETTINGS.soundEnabled,
    reducedMotion:
      typeof candidate.reducedMotion === "boolean"
        ? candidate.reducedMotion
        : DEFAULT_SETTINGS.reducedMotion,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createCloudSave(input: CloudSaveInput = {}): CloudSaveV1 {
  return {
    schemaVersion: CLOUD_SAVE_SCHEMA_VERSION,
    updatedAt: boundedNumber(input.updatedAt, Date.now()),
    progress: migrateProgress(input.progress ?? createInitialProgress()),
    daily: migrateDailyState(input.daily ?? createInitialDailyState()),
    settings: sanitizeSettings(input.settings),
  };
}

export function sanitizeCloudSave(value: unknown): CloudSaveV1 {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return createCloudSave({ updatedAt: 0 });
  const candidate = value as Partial<CloudSaveV1>;
  if (candidate.schemaVersion !== CLOUD_SAVE_SCHEMA_VERSION)
    return createCloudSave({ updatedAt: 0 });
  try {
    if (JSON.stringify(value).length > MAX_CLOUD_SAVE_BYTES)
      return createCloudSave({ updatedAt: 0 });
  } catch {
    return createCloudSave({ updatedAt: 0 });
  }
  return createCloudSave(candidate);
}

/** Compare data that matters to player progress; `updatedAt` is transport metadata. */
export function sameCloudSaveContent(a: unknown, b: unknown) {
  const left = sanitizeCloudSave(a);
  const right = sanitizeCloudSave(b);
  return (
    JSON.stringify({
      schemaVersion: left.schemaVersion,
      progress: left.progress,
      daily: left.daily,
      settings: left.settings,
    }) ===
    JSON.stringify({
      schemaVersion: right.schemaVersion,
      progress: right.progress,
      daily: right.daily,
      settings: right.settings,
    })
  );
}

function strongerCompletion(a: DailyCompletion, b: DailyCompletion) {
  if (a.rewardClaimed !== b.rewardClaimed) return a.rewardClaimed ? a : b;
  if (a.score !== b.score) return a.score > b.score ? a : b;
  if (a.accuracy !== b.accuracy) return a.accuracy > b.accuracy ? a : b;
  if (a.elapsedSeconds !== b.elapsedSeconds)
    return a.elapsedSeconds < b.elapsedSeconds ? a : b;
  return a.completedAt >= b.completedAt ? a : b;
}

function mergeDaily(local: DailyState, cloud: DailyState): DailyState {
  const completions = new Map<string, DailyCompletion>();
  for (const completion of [...local.completions, ...cloud.completions]) {
    const prior = completions.get(completion.identity);
    completions.set(
      completion.identity,
      prior ? strongerCompletion(prior, completion) : completion,
    );
  }
  return migrateDailyState({
    version: local.version,
    firstSeenDay:
      [local.firstSeenDay, cloud.firstSeenDay].filter(Boolean).sort()[0] ??
      null,
    lastObservedDay:
      [local.lastObservedDay, cloud.lastObservedDay]
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
    lastObservedAt: Math.max(local.lastObservedAt, cloud.lastObservedAt),
    completions: [...completions.values()].sort(
      (a, b) => a.completedAt - b.completedAt,
    ),
  });
}

function mergeRecord(a: PersonalBest, b: PersonalBest): PersonalBest {
  const fastest = [a.fastestWinSeconds, b.fastestWinSeconds].filter(
    (value): value is number => value !== null,
  );
  return {
    highestScore: Math.max(a.highestScore, b.highestScore),
    highestAccuracy: Math.max(a.highestAccuracy, b.highestAccuracy),
    fastestWinSeconds: fastest.length ? Math.min(...fastest) : null,
  };
}

function mergeProgress(
  local: ProgressState,
  cloud: ProgressState,
): ProgressState {
  const records: Record<string, PersonalBest> = { ...local.records };
  for (const [key, record] of Object.entries(cloud.records))
    records[key] = records[key] ? mergeRecord(records[key], record) : record;
  return migrateProgress({
    version: local.version,
    totalXp: Math.max(local.totalXp, cloud.totalXp),
    processedResultIds: [
      ...new Set([...local.processedResultIds, ...cloud.processedResultIds]),
    ].slice(-100),
    achievements: [...new Set([...local.achievements, ...cloud.achievements])],
    records,
    stats: {
      completedSessions: Math.max(
        local.stats.completedSessions,
        cloud.stats.completedSessions,
      ),
      wins: Math.max(local.stats.wins, cloud.stats.wins),
      challengeWins: Math.max(
        local.stats.challengeWins,
        cloud.stats.challengeWins,
      ),
      completedGameTypes: [
        ...new Set([
          ...local.stats.completedGameTypes,
          ...cloud.stats.completedGameTypes,
        ]),
      ],
    },
  });
}

export function mergeCloudSaves(
  localValue: unknown,
  cloudValue: unknown,
): CloudSaveV1 {
  const local = sanitizeCloudSave(localValue);
  const cloud = sanitizeCloudSave(cloudValue);
  const cloudIsNewer = cloud.updatedAt > local.updatedAt;
  return {
    schemaVersion: CLOUD_SAVE_SCHEMA_VERSION,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt, Date.now()),
    progress: mergeProgress(local.progress, cloud.progress),
    daily: mergeDaily(local.daily, cloud.daily),
    settings: cloudIsNewer ? clone(cloud.settings) : clone(local.settings),
  };
}
