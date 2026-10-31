import { describe, expect, it } from "vitest";
import { matchesCountry } from "../../src/shared/country-search";

describe("country search", () => {
  it("matches case-insensitive substrings and trims the query", () => {
    expect(matchesCountry("South Korea", " KOR ")).toBe(true);
    expect(matchesCountry("Japan", "jap")).toBe(true);
    expect(matchesCountry("Japan", "france")).toBe(false);
    expect(matchesCountry("Japan", "  ")).toBe(true);
  });
});
