import { expect, test } from "@playwright/test";

test("home credits the bundled amCharts continent maps", async ({ page }) => {
  await page.goto("./");
  const credit = page.getByRole("link", { name: "Map data © amCharts" });
  await expect(credit).toHaveAttribute(
    "href",
    "https://www.amcharts.com/svg-maps/",
  );
});

test("home credits the Twemoji flag graphics", async ({ page }) => {
  await page.goto("./");
  const credit = page.getByRole("link", { name: "Flags: Twemoji (CC BY 4.0)" });
  await expect(credit).toHaveAttribute(
    "href",
    "https://github.com/jdecked/twemoji/blob/v14.0.2/LICENSE-GRAPHICS",
  );
});

for (const [key, file, id] of [
  ["northAmerica", "north_america.svg", "US"],
  ["southAmerica", "south_america.svg", "BR"],
]) {
  test(`${key} resolves its regional SVG`, async ({ page }) => {
    await page.route("https://**/*", (route) => route.abort());
    await page.goto("./");
    await page.evaluate(
      (mapKey) =>
        (0, eval)(`applyMap(${JSON.stringify(mapKey)}); showScreen("game")`),
      key,
    );
    await expect
      .poll(() =>
        page.locator("#indiaMap").evaluate(
          (node, expected) => {
            const doc = (node as HTMLObjectElement).contentDocument;
            return Boolean(
              doc?.URL.endsWith(`/svg/${expected.file}`) &&
              doc.getElementById(expected.id),
            );
          },
          { file, id },
        ),
      )
      .toBe(true);
  });
}

test("Asia locate reports unmatched targets and excludes them from its pool", async ({
  page,
}) => {
  await page.route("https://**/*", (route) => route.abort());
  await page.goto("./");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator('.play-card[data-mode="locate"]').click();
  await page.locator("#continentScopeBtn").click();
  await page.locator('[data-continent="asia"]').click();
  await page.locator("#practiceModeBtn").click();
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#mapCoverageNotice")).toContainText("Armenia", {
    timeout: 15000,
  });
  const pool: string[] = await page.evaluate(() =>
    (0, eval)("getLocateRegions()"),
  );
  expect(pool).not.toContain("Armenia");
  expect(pool.length).toBeGreaterThan(0);
});

test("a failed live map load keeps the map unavailable and offers a retry", async ({
  page,
}) => {
  await page.route("**/svg/world.svg", (route) => route.abort());
  await page.goto("./");
  await page.evaluate(() => (0, eval)('applyMap("world"); showScreen("game")'));
  await expect(page.locator("#feedbackMessage")).toHaveText(
    "The map could not be loaded. Choose this edition again to retry.",
  );
  await expect
    .poll(() => page.evaluate(() => (0, eval)("svgLoaded")))
    .toBe(false);
});
