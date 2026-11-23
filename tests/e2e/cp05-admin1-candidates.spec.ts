import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

type Scope = {
  asset: string | null;
  question_count: number;
  status: string;
};

const scopes: Record<string, Scope> = JSON.parse(
  readFileSync("candidate/admin1/manifest.json", "utf8"),
).scopes;

test("source-pinned Admin-1 candidates render and expose every approved gameplay target to keyboard focus", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Candidates intentionally do not ship in production or subpath builds.",
  );

  for (const [scope, candidate] of Object.entries(scopes)) {
    if (
      candidate.status !==
      "candidate_ready_for_manual_geometry_and_interaction_review"
    )
      continue;
    await page.goto(`./${candidate.asset}`);
    const svg = page.locator("svg");
    await expect(svg).toHaveAttribute("data-cp05-status", "candidate-not-live");
    await expect(svg).toHaveAttribute(
      "aria-label",
      `${scope} administrative candidate`,
    );
    const targets = page.locator("g[data-question-key]");
    await expect(targets).toHaveCount(candidate.question_count);
    const first = targets.first();
    await first.focus();
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement?.getAttribute("data-question-key"),
        ),
      )
      .toBe(await first.getAttribute("data-question-key"));
    await expect(first.locator("path").first()).toBeVisible();
  }
});
