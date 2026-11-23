import { expect, test, type Page } from "@playwright/test";

async function dismissGuide(page: Page) {
  await page.goto("./");
  const skip = page.getByRole("button", { name: "Skip for now" });
  if (await skip.isVisible()) await skip.click();
}

async function startLocate(page: Page) {
  await dismissGuide(page);
  const play = page.locator("nav").getByRole("button", { name: "Play" });
  if (!(await play.isVisible())) await page.locator("#menuToggle").click();
  await play.click();
  await page.locator('.play-card[data-mode="locate"]').click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#gameScreen")).toBeVisible();
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          (0, eval)(
            "Boolean(gameState.currentTarget && getLocateRegions().length && getSvgDoc()?.querySelector('path'))",
          ),
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
}

test("Locate keeps its target legible and offers a complete keyboard answer path", async ({
  page,
}) => {
  await startLocate(page);

  const target = page.locator("#locatePrompt .locate-name");
  await expect(target).not.toBeEmpty();
  await expect(target).toHaveCSS("color", "rgb(26, 26, 26)");

  const answer = page.locator("#locateAnswerSelect");
  await expect(answer).toBeVisible();
  await expect(page.locator("#indiaMap")).toHaveAttribute("tabindex", "-1");
  await answer.focus();
  const expectedAnswer = await page.evaluate(() =>
    (0, eval)("gameState.currentTarget"),
  );
  await answer.selectOption(String(expectedAnswer));
  await page.getByRole("button", { name: "Check map answer" }).press("Enter");
  await expect(page.locator("#progressLabel")).toContainText("1 /");
});

test("choice rounds replace feedback and learning state before the next prompt", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /easy/i }).click();
  await expect(page.locator("#choiceOptions button")).toHaveCount(4);

  const prompt = page.locator("#choicePrompt");
  const initialPrompt = await prompt.textContent();
  const correct = await page.evaluate(() =>
    (0, eval)("gameState.choiceQuestion.answerId"),
  );
  await page.evaluate((answer) => {
    const prompt = document.querySelector("#choicePrompt");
    const choice = [
      ...document.querySelectorAll<HTMLButtonElement>("#choiceOptions button"),
    ].find((button) => button.textContent === answer)!;
    choice.addEventListener(
      "click",
      () => {
        (
          window as Window & {
            choiceStartedAt?: number;
          }
        ).choiceStartedAt = performance.now();
      },
      { capture: true, once: true },
    );
    new MutationObserver(() => {
      (
        window as Window & { choicePromptChangedAt?: number }
      ).choicePromptChangedAt ??= performance.now();
    }).observe(prompt!, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }, String(correct));
  await page
    .getByRole("button", { name: String(correct), exact: true })
    .click();
  await expect(prompt).not.toHaveText(initialPrompt ?? "");
  expect(
    await page.evaluate(() => {
      const timing = window as typeof window & {
        choiceStartedAt?: number;
        choicePromptChangedAt?: number;
      };
      return (
        (timing.choicePromptChangedAt ?? Number.POSITIVE_INFINITY) -
        (timing.choiceStartedAt ?? 0)
      );
    }),
  ).toBeLessThan(500);
  await expect(page.locator("#choiceFeedback")).toBeEmpty();
  await expect(page.locator("#learningCue")).toBeHidden();
  await expect(page.locator("#learningCue")).not.toContainText(String(correct));
});

test("Daily identity follows the selected route and the calendar names today", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /easy/i }).focus();
  await expect(page.locator("#dailyIdentity")).toContainText(":easy");
  await expect(page.locator("#dailyCalendarOrientation")).toContainText(
    /today/i,
  );
  await expect(
    page.locator("#dailyCalendar [aria-current='date']"),
  ).toHaveAttribute("aria-label", /today/i);
});

test("unconfigured accounts are explicit, non-interactive, and remain guest-safe", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.getByRole("button", { name: "Account" }).click();
  await expect(page.locator("#accountUnavailable")).toContainText(
    "Accounts are unavailable in this build",
  );
  await expect(page.locator("#accountEmail")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Create account" }),
  ).toBeDisabled();
  await expect(page.getByTestId("cloud-sync-status")).toHaveText("Local only");
});

test("account modal is an isolated opaque top-layer interruption", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.getByRole("button", { name: "Account" }).click();
  const dialog = page.locator("#accountDialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("isolation", "isolate");
  await expect(dialog).toHaveCSS("background-color", "rgb(36, 36, 36)");
  expect(
    await page.locator("#accountIdentity").evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const top = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      return Boolean(
        top && document.querySelector("#accountDialog")?.contains(top),
      );
    }),
  ).toBe(true);
});

test("active play uses a compact shell and consistent dark answer controls", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /medium/i }).click();
  await expect(page.locator("body")).toHaveClass(/mm-in-game/);
  await expect(page.locator(".site-header nav")).toBeHidden();
  await expect(page.locator("#topBar > div")).toHaveCount(4);
  expect(
    await page
      .locator(".choice-option")
      .first()
      .evaluate((button) => {
        const [red, green, blue] = getComputedStyle(button)
          .backgroundColor.match(/\d+/g)!
          .map(Number);
        return red < 100 && green < 100 && blue < 100;
      }),
  ).toBe(true);
});

test("new players get a short recommended route without changing progression rules", async ({
  page,
}) => {
  await dismissGuide(page);
  await page.locator("nav").getByRole("button", { name: "Progress" }).click();
  await expect(page.locator("#progressSummary")).toContainText("Daily Easy");
  await expect(
    page.getByRole("button", { name: "Try Daily Easy" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try Daily Easy" }).click();
  await expect(page.locator("#dailyScreen")).toBeVisible();
  await expect(page.locator("#dailyIdentity")).toContainText(":easy");
});

test("reduced motion preserves the immediate Sprint replacement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await dismissGuide(page);
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /easy/i }).click();
  const prompt = page.locator("#choicePrompt");
  const before = await prompt.textContent();
  const answer = await page.evaluate(() =>
    (0, eval)("gameState.choiceQuestion.answerId"),
  );
  await page.getByRole("button", { name: String(answer), exact: true }).click();
  await expect(prompt).not.toHaveText(before ?? "");
  await expect(page.locator("#choiceFeedback")).toBeEmpty();
  await expect(page.locator("#learningCue")).toBeHidden();
});

test("a local Daily round produces no console errors or failed local requests", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => failedRequests.push(request.url()));

  await dismissGuide(page);
  await page.getByRole("button", { name: "Daily challenge" }).click();
  await page.getByRole("button", { name: /easy/i }).click();
  await expect(page.locator("#choiceOptions button")).toHaveCount(4);
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test.describe("mobile audit remediation", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("Locate remains legible and keyboard-operable without overflow", async ({
    page,
  }) => {
    await startLocate(page);
    await expect(page.locator("#locatePrompt .locate-name")).not.toBeEmpty();
    await expect(page.locator("#locateAnswerSelect")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });

  test("Daily, account, progress, and the compact play shell stay clear on mobile", async ({
    page,
  }) => {
    await dismissGuide(page);
    await page.getByRole("button", { name: "Daily challenge" }).click();
    await page.getByRole("button", { name: /easy/i }).focus();
    await expect(page.locator("#dailyIdentity")).toContainText(":easy");
    await expect(page.locator("#dailyCalendarOrientation")).toContainText(
      /today/i,
    );
    await page.getByRole("button", { name: /easy/i }).click();
    await expect(page.locator(".site-header")).toBeHidden();
    expect(
      await page
        .locator(".choice-option")
        .first()
        .evaluate((button) => {
          const [red, green, blue] = getComputedStyle(button)
            .backgroundColor.match(/\d+/g)!
            .map(Number);
          return red < 100 && green < 100 && blue < 100;
        }),
    ).toBe(true);
    await page.locator("#headerRestartBtn").click();
    await page.getByRole("button", { name: "Account" }).click();
    await expect(page.locator("#accountUnavailable")).toBeVisible();
    await expect(page.locator("#accountEmail")).toBeDisabled();
    await page.getByRole("button", { name: "Close account" }).click();
    await page.locator("#menuToggle").click();
    await page.locator("nav").getByRole("button", { name: "Progress" }).click();
    await expect(page.locator("#progressSummary")).toContainText("Daily Easy");
  });
});
