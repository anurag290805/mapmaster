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

export function buildChoiceOptions(
  correct: string,
  candidates: readonly string[],
  count = 4,
  random: () => number = Math.random,
): string[] {
  const shuffle = (items: string[]) => {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const pick = Math.floor(random() * (index + 1));
      [items[index], items[pick]] = [items[pick], items[index]];
    }
    return items;
  };
  const correctKey = normalizeAnswer(correct);
  if (!correctKey || count < 2) return [];
  const seen = new Set([correctKey]);
  const distractors = candidates.filter((candidate) => {
    const key = normalizeAnswer(candidate);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (distractors.length < count - 1) return [];
  return shuffle([correct, ...shuffle(distractors).slice(0, count - 1)]);
}

export function buildLearningRecord(prompt: string, answer: string) {
  return {
    prompt,
    answer,
    // Candidate facts remain unavailable to gameplay until independently
    // approved and explicitly promoted. The UI renders only concise answer
    // feedback in that state, never a technical availability disclaimer.
    sourceStatus: "not-approved" as const,
    sourceNote: "",
  };
}
