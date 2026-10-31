/** Stateless gameplay rules. The legacy gameState remains the only session store. */
export type AnswerResolution =
  { kind: "match"; id: string } | { kind: "ambiguous" | "none" };

export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[\s\p{P}]+/gu, "");
}

// Stable, explicitly reviewed abbreviations for unambiguous country names.
export const ANSWER_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "United States": ["USA", "United States of America"],
  "United Kingdom": ["UK"],
  "United Arab Emirates": ["UAE"],
};

export function resolveAnswer(
  input: string,
  ids: readonly string[],
  aliases: Readonly<Record<string, readonly string[]>> = ANSWER_ALIASES,
): AnswerResolution {
  const key = normalizeAnswer(input);
  if (!key) return { kind: "none" };
  const matches = ids.filter((id) =>
    [id, ...(aliases[id] ?? [])].some((name) => normalizeAnswer(name) === key),
  );
  return matches.length === 1
    ? { kind: "match", id: matches[0] }
    : { kind: matches.length ? "ambiguous" : "none" };
}

export function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function accuracy(correct: number, attempts: number): number {
  return attempts ? Math.round((correct / attempts) * 100) : 100;
}
