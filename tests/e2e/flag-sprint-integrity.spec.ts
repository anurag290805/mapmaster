import { expect, test, type Page } from "@playwright/test";

async function startFlagSprint(page: Page) {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('[data-mode="flagChoice"]').click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#flagChoiceModeBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#choiceContainer")).toBeVisible();
}

async function prepareBosniaRound(page: Page, staleAnswer = false) {
  return page.evaluate(
    ({ staleAnswer }) =>
      (0, eval)(`
        CURRENT_REGIONS = [
          "Bosnia and Herzegovina", "Paraguay", "Ecuador", "Niger"
        ];
        showChoiceTarget("Bosnia and Herzegovina");
        ${staleAnswer ? 'gameState.choiceAnswer = "Paraguay";' : ""}
        ({ id: gameState.choiceQuestion.id, answer: gameState.choiceQuestion.answerId });
      `),
    { staleAnswer },
  );
}

test("Bosnia's rendered flag cannot award a stale Paraguay answer", async ({
  page,
}) => {
  await page.route("https://**/*", (route) => route.abort());
  await startFlagSprint(page);

  const before = await prepareBosniaRound(page, true);

  await expect(page.locator("#choiceVisual .flag-img")).toHaveAttribute(
    "src",
    /1f1e7-1f1e6\.png$/,
  );
  await page.getByRole("button", { name: "Paraguay", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (0, eval)(`({
          id: gameState.choiceQuestion?.id,
          score: gameState.score,
          streak: gameState.currentStreak,
          attempts: gameState.totalAttempts,
          guessed: gameState.guessedStates.length,
        })`),
      ),
    )
    .toEqual({
      id: expect.not.stringMatching(new RegExp(`^${before.id}$`)),
      score: 0,
      streak: 0,
      attempts: 0,
      guessed: 0,
    });
  await expect(page.locator("#choiceOptions button")).toHaveCount(4);
  await expect(page.locator("#learningCue")).toBeHidden();
});

test("a legitimate Bosnia answer scores exactly once with keyboard input", async ({
  page,
}) => {
  await page.route("https://**/*", (route) => route.abort());
  await startFlagSprint(page);
  await prepareBosniaRound(page);

  const bosnia = page.getByRole("button", {
    name: "Bosnia and Herzegovina",
    exact: true,
  });
  await bosnia.focus();
  await bosnia.press("Enter");
  await expect(page.locator("#scoreDisplay")).toHaveText("1");
  await expect(page.locator("#choiceFeedback")).toBeEmpty();
  await expect(page.locator("#learningCue")).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(page.locator("#scoreDisplay")).toHaveText("1");
});

test("every active Flag Sprint entry has a canonical country and matching flag code", async ({
  page,
}) => {
  await page.goto("./");
  const audit = await page.evaluate(() =>
    (0, eval)(`
      Object.entries(FLAGS)
        .filter(([country]) => MAPS.world.regions.includes(country))
        .map(([country]) => flagIdentityFor(country))
    `),
  );

  expect(audit).toHaveLength(129);
  expect(audit).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        country: "Bosnia and Herzegovina",
        countryCode: "BA",
        flagEmoji: "🇧🇦",
      }),
      expect.objectContaining({
        country: "Paraguay",
        countryCode: "PY",
        flagEmoji: "🇵🇾",
      }),
    ]),
  );
  expect(audit.every((entry: { valid: boolean }) => entry.valid)).toBe(true);
});

test("Flag Sprint clears answer feedback before it renders the next question", async ({
  page,
}) => {
  await page.route("https://**/*", (route) => route.abort());
  await startFlagSprint(page);
  await expect(page.locator("#learningCue")).toBeHidden();

  const answer = await page.evaluate(() =>
    (0, eval)("gameState.choiceQuestion.answerId"),
  );
  await page.getByRole("button", { name: answer, exact: true }).click();
  await expect(page.locator("#choiceFeedback")).toBeEmpty();
  await expect(page.locator("#learningCue")).toBeHidden();
  await expect(page.locator("#learningCue")).not.toContainText(answer);
  await expect(page.locator("#learningCue")).not.toContainText(
    "independently sourced",
  );
});
