import { describe, expect, it } from "vitest";
import {
  accuracy,
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
});
