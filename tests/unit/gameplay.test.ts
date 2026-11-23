import { describe, expect, it } from "vitest";
import {
  accuracy,
  buildChoiceOptions,
  buildLearningRecord,
  normalizeAnswer,
  remainingSeconds,
  resolveAnswer,
} from "../../src/shared/gameplay";

describe("gameplay rules", () => {
  it("accepts only complete normalized names and rejects ambiguous aliases", () => {
    const ids = ["Côte d'Ivoire", "Japan", "Niger", "Nigeria"];
    expect(resolveAnswer(" cote d’ivoire ", ids)).toEqual({
      kind: "match",
      id: "Côte d'Ivoire",
    });
    expect(resolveAnswer("nig", ids)).toEqual({ kind: "none" });
    expect(resolveAnswer("Niger", ids)).toEqual({ kind: "match", id: "Niger" });
    expect(
      resolveAnswer("shared", ids, { Japan: ["shared"], Niger: ["shared"] }),
    ).toEqual({ kind: "ambiguous" });
    expect(resolveAnswer("nippon", ids, { Japan: ["Nippon"] })).toEqual({
      kind: "match",
      id: "Japan",
    });
    expect(normalizeAnswer("  São Tomé ")).toBe("saotome");
  });
  it("calculates time from a deadline and accuracy from correct attempts", () => {
    expect(remainingSeconds(10000, 8001)).toBe(2);
    expect(remainingSeconds(10000, 12000)).toBe(0);
    expect(accuracy(2, 3)).toBe(67);
    expect(accuracy(0, 0)).toBe(100);
  });

  it("builds distinct, deterministic multiple-choice options around the answer", () => {
    const next = [0.9, 0.1, 0.5, 0.9, 0.9];
    expect(
      buildChoiceOptions(
        "Tokyo",
        ["Tokyo", "Delhi", "Paris", "Paris", "Lima"],
        4,
        () => next.shift() ?? 0,
      ),
    ).toEqual(["Tokyo", "Paris", "Lima", "Delhi"]);
    expect(
      buildChoiceOptions(
        "Tokyo",
        ["Tokyo", "Delhi", "Paris", "Lima", "Rome"],
        4,
        () => 0,
      ),
    ).toHaveLength(4);
    expect(buildChoiceOptions("Tokyo", ["Tokyo"], 4)).toEqual([]);
  });

  it("keeps unapproved country facts out of polished learning feedback", () => {
    expect(buildLearningRecord("Capital of Japan", "Tokyo")).toEqual({
      prompt: "Capital of Japan",
      answer: "Tokyo",
      sourceStatus: "not-approved",
      sourceNote: "",
    });
  });
});
