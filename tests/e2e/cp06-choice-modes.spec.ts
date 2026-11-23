import { expect, test, type Page } from "@playwright/test";

const modes = ["capitalChoice", "flagChoice"] as const;

async function waitForGameplayBridge(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          typeof (
            window as typeof window & {
              MapMasterGameplay?: { buildChoiceOptions?: unknown };
            }
          ).MapMasterGameplay?.buildChoiceOptions === "function",
      ),
    )
    .toBe(true);
}

async function start(
  page: Page,
  mode: (typeof modes)[number],
  challenge = false,
) {
  await page.goto("./");
  await waitForGameplayBridge(page);
  await page.getByRole("button", { name: "Skip for now" }).click();
  const play = page.locator("nav").getByRole("button", { name: "Play" });
  if (!(await play.isVisible())) await page.locator("#menuToggle").click();
  await play.click();
  await page.locator(`.play-card[data-mode="${mode}"]`).click();
  await page.locator("#worldScopeBtn").click();
  await page.locator(`#${mode}ModeBtn`).click();
  await page
    .locator(challenge ? "#challengeModeBtn" : "#practiceModeBtn")
    .click();
  await page.locator("#homeStartBtn").click();
  if (challenge) {
    await page.locator('[data-time="120"]').click();
    await page.locator("#startGameBtn").click();
  }
  await expect(page.locator("#choiceContainer")).toBeVisible();
}

test("choice challenge reuses the CP04 timer and unlimited lives", async ({
  page,
}) => {
  await page.route("https://**/*", (route) => route.abort());
  await start(page, "capitalChoice", true);
  await expect(page.locator("#timerDisplay")).not.toHaveText("∞");
  await expect(page.locator("#livesDisplay")).toHaveText("∞");
});

for (const mode of modes) {
  test(`${mode} supports wrong, keyboard-correct and restart paths`, async ({
    page,
  }) => {
    await page.route("https://**/*", (route) => route.abort());
    await start(page, mode);
    await expect(page.locator("#choiceOptions button")).toHaveCount(4);
    const answer = await page.evaluate(() =>
      (0, eval)("gameState.choiceAnswer"),
    );
    const wrong = page
      .locator("#choiceOptions button")
      .filter({ hasNotText: answer })
      .first();
    await wrong.click();
    await expect(wrong).toBeDisabled();
    await expect(page.locator("#choiceFeedback")).toContainText("Not correct");
    await expect(page.locator("#feedbackMessage")).toHaveText("");
    const correct = page.getByRole("button", { name: answer, exact: true });
    await correct.focus();
    await correct.press("Enter");
    await expect(page.locator("#scoreDisplay")).toHaveText("1");
    await page.locator("#headerRestartBtn").click();
    await expect(page.locator("#startScreen")).toBeVisible();
  });
}

test("Flag Sprint exposes a nonvisual Unicode flag-code challenge without naming the answer", async ({
  page,
}) => {
  await page.route("https://**/*", (route) => route.abort());
  await start(page, "flagChoice");
  const answer = await page.evaluate(() => (0, eval)("gameState.choiceAnswer"));
  const cue = page.locator("#choiceVisual .flag-code-cue");
  await expect(cue).toHaveText(/Unicode regional-indicator code:/);
  await expect(cue).not.toContainText(answer);
});

test("choice pools contain four distinct answer options for every enabled map", async ({
  page,
}) => {
  await page.goto("./");
  await waitForGameplayBridge(page);
  const violations = await page.evaluate(() =>
    (0, eval)(`Object.entries(MAPS).flatMap(([mapKey, map]) => {
      const support = MAP_SUPPORT[mapKey];
      const capitals = mapKey === "world" ? CAPITALS.world : CAPITALS[mapKey];
      const flagAnswers = map.regions.filter((region) => FLAGS[region]);
      const capitalAnswers = (capitals ? map.regions.filter((region) => capitals[region]) : [])
        .map((region) => capitals[region]);
      const uniqueCapitals = new Set(capitalAnswers.map((answer) => MapMasterGameplay.normalizeAnswer(answer)));
      const issues = [];
      if (support.flag && flagAnswers.length < 4) issues.push("flag");
      if (support.capital && uniqueCapitals.size < 4) issues.push("capital");
      return issues.map((mode) => mapKey + ":" + mode);
    })`),
  );
  expect(violations).toEqual([]);
});

for (const mode of modes) {
  test(`${mode} rejects an answer after its deadline and leaves no stale transition`, async ({
    page,
  }) => {
    await page.route("https://**/*", (route) => route.abort());
    await start(page, mode, true);
    await page.evaluate(() =>
      (0, eval)("gameState.deadline = performance.now() - 1"),
    );
    await page.locator("#choiceOptions button").first().click();
    await expect(page.locator("#loseScreen")).toBeVisible();
    await expect(page.locator("#scoreDisplay")).toHaveText("0");
    await page.waitForTimeout(500);
    await expect(page.locator("#loseScreen")).toBeVisible();
  });
}

test("choice controls start focused and stack for mobile interaction", async ({
  page,
}) => {
  await page.route("https://**/*", (route) => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page, "capitalChoice");
  const options = page.locator("#choiceOptions button");
  await expect(options.first()).toBeFocused();
  const first = await options.nth(0).boundingBox();
  const second = await options.nth(1).boundingBox();
  expect(first && second && second.y > first.y).toBeTruthy();
});

test("choice modes refuse an empty question pool", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('.play-card[data-mode="flagChoice"]').click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#flagChoiceModeBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.evaluate(() => (0, eval)("CURRENT_REGIONS = []"));
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#gameScreen")).toBeHidden();
});
