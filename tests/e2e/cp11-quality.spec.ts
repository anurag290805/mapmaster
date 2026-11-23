import { expect, test } from "@playwright/test";

function contrastRatio([r, g, b]: number[], [r2, g2, b2]: number[]) {
  const luminance = ([red, green, blue]: number[]) => {
    const channels = [red, green, blue].map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [lighter, darker] = [
    luminance([r, g, b]),
    luminance([r2, g2, b2]),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe("CP11 touch quality gate", () => {
  // This cold mobile path can share the development host with CP05 geometry
  // diagnostics during the complete suite; retain behavior assertions while
  // allowing that deliberate contention to settle.
  test.setTimeout(60_000);

  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("a touch user can start a configured practice game without keyboard fallback", async ({
    page,
  }) => {
    await page.goto("./");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            typeof (
              window as typeof window & {
                MapMasterGameplay?: { remainingSeconds?: unknown };
              }
            ).MapMasterGameplay?.remainingSeconds === "function",
        ),
      )
      .toBe(true);
    const skip = page.getByRole("button", { name: "Skip for now" });
    if (await skip.isVisible()) await skip.click();
    const play = page.locator("nav").getByRole("button", { name: "Play" });
    if (!(await play.isVisible())) await page.locator("#menuToggle").tap();
    await play.tap();
    await page.locator(".play-card[data-mode='typing']").tap();
    await page.locator("#worldScopeBtn").tap();
    await page.locator("#practiceModeBtn").tap();
    const start = page.locator("#homeStartBtn");
    await expect(start).toBeEnabled();
    const startPoint = await start.evaluate((button) => {
      const box = button.getBoundingClientRect();
      return {
        height: box.height,
        hitId: document.elementFromPoint(
          box.left + box.width / 2,
          box.top + box.height / 2,
        )?.id,
        width: box.width,
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
      };
    });
    expect(startPoint.width).toBeGreaterThanOrEqual(44);
    expect(startPoint.height).toBeGreaterThanOrEqual(44);
    expect(startPoint.hitId).toBe("homeStartBtn");
    await page.touchscreen.tap(startPoint.x, startPoint.y);
    await expect(page.locator("#gameScreen")).toBeVisible();
    await expect(page.locator("#inputSection")).toBeVisible();
  });

  test("320px setup remains horizontally usable at 200% text scaling", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("./");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            typeof (
              window as typeof window & {
                MapMasterGameplay?: { remainingSeconds?: unknown };
              }
            ).MapMasterGameplay?.remainingSeconds === "function",
        ),
      )
      .toBe(true);
    const skip = page.getByRole("button", { name: "Skip for now" });
    if (await skip.isVisible()) await skip.click();
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    await page.locator("#menuToggle").tap();
    await page.locator("nav").getByRole("button", { name: "Play" }).tap();
    await page.locator(".play-card[data-mode='typing']").tap();
    await page.locator("#worldScopeBtn").tap();
    await page.locator("#practiceModeBtn").focus();
    await page.locator("#practiceModeBtn").press("Enter");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      await page.locator("#homeStartBtn").evaluate((button) => {
        const box = button.getBoundingClientRect();
        return box.width >= 44 && box.height >= 44;
      }),
    ).toBe(true);
  });

  test("critical primary and feedback states retain text contrast", async ({
    page,
  }) => {
    await page.goto("./");
    await page.evaluate(() => {
      document.body.classList.add("dark-theme");
      (document.querySelector("#homeStartBtn") as HTMLButtonElement).disabled =
        false;
    });
    const colors = await page.evaluate(() => {
      const rgb = (value: string) =>
        value.match(/\d+/g)?.slice(0, 3).map(Number) || [];
      const primary = document.querySelector("#homeStartBtn") as HTMLElement;
      const feedback = document.querySelector(
        "#feedbackMessage",
      ) as HTMLElement;
      feedback.className = "correct";
      const correct = rgb(getComputedStyle(feedback).color);
      feedback.className = "wrong";
      const wrong = rgb(getComputedStyle(feedback).color);
      return {
        correct,
        primaryBackground: rgb(getComputedStyle(primary).backgroundColor),
        primaryText: rgb(getComputedStyle(primary).color),
        surface: rgb(getComputedStyle(document.body).backgroundColor),
        wrong,
      };
    });
    expect(
      contrastRatio(colors.primaryBackground, colors.primaryText),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(colors.correct, colors.surface),
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.wrong, colors.surface)).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
