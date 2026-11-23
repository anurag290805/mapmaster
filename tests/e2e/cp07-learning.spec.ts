import { expect, test } from "@playwright/test";

async function startFlagSprint(page: import("@playwright/test").Page) {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('[data-mode="flagChoice"]').click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#flagChoiceModeBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
}

test("correct Sprint answers advance without carrying candidate feedback into the next round", async ({
  page,
}) => {
  await page.route("https://**/*", (route) => route.abort());
  await startFlagSprint(page);
  const answer = await page.evaluate(() =>
    (0, eval)("gameState.choiceQuestion.answerId"),
  );
  await expect(page.locator("#learningCue")).toBeHidden();
  const wrong = page
    .locator("#choiceOptions button")
    .filter({ hasNotText: answer })
    .first();
  await wrong.click();
  await expect(page.locator("#learningCue")).toBeHidden();

  await page.getByRole("button", { name: answer, exact: true }).click();
  await expect(page.locator("#learningCue")).toBeHidden();
  await expect(page.locator("#learningCue")).not.toContainText(answer);
  await expect(page.locator("#learningCue")).not.toContainText(
    "independently sourced",
  );
});

test("free-recall misses hide the Learning Cue without a runtime error", async ({
  page,
}) => {
  let pageError: Error | null = null;
  page.on("pageerror", (error) => {
    pageError = error;
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('.play-card[data-mode="typing"]').click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#typingModeBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
  await page.locator("#stateInput").fill("not a country");
  await page.locator("#submitAnswerBtn").click();

  await expect(page.locator("#learningCue")).toBeHidden();
  await expect(page.locator("#learningCue")).not.toContainText("Japan");
  await expect(page.locator("#learningCue")).not.toContainText(
    "independently sourced",
  );
  expect(pageError).toBeNull();
});

test("review pages missed answers with keyboard controls and can return to setup", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.evaluate(() => {
    (0, eval)(`
      currentMapKey = "world";
      CURRENT_REGIONS = MAPS.world.regions;
      gameState.gameType = "capital";
      gameState.missedRegions = ["Japan", "India"];
      gameState.guessedStates = [];
      enterReviewMode();
    `);
  });

  await expect(page.locator("#learningReview")).toBeVisible();
  await expect(page.locator("#learningReviewProgress")).toHaveAttribute(
    "role",
    "status",
  );
  await expect(page.locator("#learningReviewAnswer")).toContainText("Tokyo");
  await page.locator("#learningReviewNext").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#learningReviewAnswer")).toContainText(
    "New Delhi",
  );
  await page.locator("#learningReviewPrevious").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#learningReviewAnswer")).toContainText("Tokyo");
  await page.locator("#learningReviewExit").click();
  await expect(page.locator("#startScreen")).toBeVisible();
});

for (const [mode, prompt, answer] of [
  ["typing", "Accepted name", "Japan"],
  ["locate", "Map target", "Japan"],
  ["flag", "Flag prompt", "Japan"],
  ["capital", "Capital prompt: Japan", "Tokyo"],
  ["flagChoice", "Flag prompt", "Japan"],
  ["capitalChoice", "Capital prompt: Japan", "Tokyo"],
]) {
  test(`review uses the accepted ${mode} answer without exposing candidate facts`, async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("button", { name: "Skip for now" }).click();
    await page.evaluate(
      ({ mode }) => {
        (0, eval)(`
          currentMapKey = "world";
          CURRENT_REGIONS = MAPS.world.regions;
          gameState.gameType = ${JSON.stringify(mode)};
          gameState.phase = "ended";
          gameState.missedRegions = ["Japan"];
          enterReviewMode();
        `);
      },
      { mode },
    );

    await expect(page.locator("#learningReviewPrompt")).toContainText(prompt);
    await expect(page.locator("#learningReviewAnswer")).toContainText(answer);
    await expect(page.locator("#learningReviewSource")).toHaveText("");
  });
}

test("empty review and long names remain useful on a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.evaluate(() => {
    (0, eval)(`
      currentMapKey = "world";
      CURRENT_REGIONS = MAPS.world.regions;
      gameState.gameType = "typing";
      gameState.phase = "ended";
      gameState.missedRegions = [];
      enterReviewMode();
    `);
  });

  await expect(page.locator("#learningReviewProgress")).toHaveText(
    "No missed answers to review.",
  );
  await expect(page.locator("#learningReviewPrevious")).toBeDisabled();
  await expect(page.locator("#learningReviewNext")).toBeDisabled();
  await page.evaluate(() => {
    (0, eval)(`
      gameState.missedRegions = ["Bosnia and Herzegovina"];
      showLearningReview();
    `);
  });
  await expect(page.locator("#learningReviewAnswer")).toContainText(
    "Bosnia and Herzegovina",
  );
  const bounds = await page.locator("#learningReview").evaluate((card) => {
    const rect = card.getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: window.innerWidth };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.width);
});

test("active gameplay cannot open review or expose a saved answer", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.evaluate(() => {
    (0, eval)(`
      currentMapKey = "world";
      CURRENT_REGIONS = MAPS.world.regions;
      gameState.gameType = "capital";
      gameState.phase = "active";
      gameState.missedRegions = ["Japan"];
      enterReviewMode();
    `);
  });

  await expect(page.locator("#learningReview")).toBeHidden();
  await expect(page.locator("#startScreen")).toBeVisible();
});

test("a completed session keeps its missed review without changing the result", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.evaluate(() => {
    (0, eval)(`
      currentMapKey = "world";
      CURRENT_REGIONS = MAPS.world.regions;
      gameState.gameType = "flag";
      gameState.gameMode = "practice";
      gameState.phase = "active";
      gameState.score = 7;
      gameState.totalAttempts = 9;
      gameState.missedRegions = ["Japan"];
      endGame(true);
    `);
  });

  await expect(page.locator("#winReviewBtn")).toBeVisible();
  await page.locator("#winReviewBtn").click();
  await expect(page.locator("#learningReviewAnswer")).toContainText("Japan");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (0, eval)(
          "[gameState.score, gameState.totalAttempts, gameState.phase]",
        ),
      ),
    )
    .toEqual([7, 9, "ended"]);
});

test("unrecognized free-recall attempts are not described as error-free", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.evaluate(() => {
    (0, eval)(`
      currentMapKey = "world";
      CURRENT_REGIONS = MAPS.world.regions;
      gameState.gameType = "typing";
      gameState.gameMode = "practice";
      gameState.phase = "active";
      gameState.unreviewableAttempts = 1;
      endGame(true);
    `);
  });

  await expect(page.locator("#winLearningCopy")).toContainText(
    "Unrecognized free-recall attempts",
  );
  await expect(page.locator("#winReviewBtn")).toBeHidden();
});
