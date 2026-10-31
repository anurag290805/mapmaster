import { expect, test, type Page } from "@playwright/test";

async function start(page: Page, mode: string, keyboardStart = false) {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  const play = page.locator("nav").getByRole("button", { name: "Play" });
  if (!(await play.isVisible())) await page.locator("#menuToggle").click();
  await play.click();
  await page.locator(`.play-card[data-mode="${mode}"]`).click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#practiceModeBtn").click();
  if (keyboardStart) {
    await page.locator("#homeStartBtn").focus();
    await page.locator("#homeStartBtn").press("Enter");
  } else {
    await page.locator("#homeStartBtn").click();
  }
  await expect(page.locator("#gameScreen")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route("https://**/*", (route) => route.abort());
});

for (const mode of ["typing", "flag", "capital"]) {
  test(`${mode} keyboard game completes and retains focus at transitions`, async ({
    page,
  }) => {
    await start(page, mode);
    await expect(page.locator("#gameScreen")).toBeFocused();
    const info = await page.evaluate(
      (game) =>
        (0, eval)(`(() => {
      const target = ${JSON.stringify(game)} === 'typing' ? 'Japan' : gameState.currentTarget;
      CURRENT_REGIONS = [target];
      return { target, answer: ${JSON.stringify(game)} === 'capital' ? CAPITALS.world[target] : target };
    })()`),
      mode,
    );
    if (mode === "flag") {
      await expect(page.locator(".flag-img")).toHaveAccessibleName(
        "Flag to identify",
      );
      await expect(page.locator(".flag-img")).not.toHaveAccessibleName(
        info.target,
      );
    }
    await page.locator("#stateInput").focus();
    await page.locator("#stateInput").fill(info.answer);
    await page.locator("#stateInput").press("Enter");
    await expect(page.locator("#winScreen")).toBeVisible();
    await expect(page.locator("#winScreen")).toBeFocused();
    await page.locator("#restartBtn").click();
    await expect(page.locator("#startScreen")).toBeFocused();
  });
}

test("locate completes through the browser map event listener", async ({
  page,
}) => {
  await start(page, "locate");
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          (0, eval)(
            `Boolean(svgLoaded && gameState.currentTarget && getSvgDoc()?.URL.endsWith('/svg/world.svg'))`,
          ),
        ),
      { timeout: 15000 },
    )
    .toBe(true);
  const dispatched = await page.evaluate(() =>
    (0, eval)(`(() => {
    const path = [...getSvgDoc().querySelectorAll('path')].find(p => CURRENT_REGIONS.includes(getRegionName(p)));
    if (!path) return false;
    const name = getRegionName(path); CURRENT_REGIONS = [name]; gameState.currentTarget = name;
    path.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true;
  })()`),
  );
  expect(dispatched).toBe(true);
  await expect(page.locator("#winScreen")).toBeVisible();
  await expect(page.locator("#winScreen")).toBeFocused();
});

test.describe("touch viewport", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  test("touch can submit an answer in a running game", async ({ page }) => {
    await start(page, "typing", true);
    await page.locator("#stateInput").fill("Japan");
    await page.locator("#submitAnswerBtn").tap();
    await expect(page.locator("#progressLabel")).toContainText("1 / 194");
  });
});

test("rapid mode changes leave only the selected mode active", async ({
  page,
}) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('.play-card[data-mode="typing"]').click();
  await page.locator("#worldScopeBtn").click();
  for (const button of [
    "#flagModeBtn",
    "#capitalModeBtn",
    "#locateModeBtn",
    "#typingModeBtn",
  ])
    await page.locator(button).click();
  await expect(page.locator("#typingModeBtn")).toHaveClass(/selected/);
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#inputSection")).toBeVisible();
  await expect(page.locator("#locatePrompt")).toBeHidden();
  await expect(page.locator("#flagContainer")).toBeHidden();
  await expect(page.locator("#capitalPrompt")).toBeHidden();
});
