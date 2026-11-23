import { expect, test } from "@playwright/test";

for (const [region, id, name] of [
  ["northAmerica", "US", "United States"],
  ["southAmerica", "BR", "Brazil"],
]) {
  test(`${region} locate accepts a real mouse click on ${name}`, async ({
    page,
  }) => {
    await page.route("https://**/*", (route) => route.abort());
    await page.goto("./");
    await page.getByRole("button", { name: "Skip for now" }).click();
    await page.locator("nav").getByRole("button", { name: "Play" }).click();
    await page.locator('.play-card[data-mode="locate"]').click();
    await page.locator("#continentScopeBtn").click();
    await page.locator(`[data-continent="${region}"]`).click();
    await page.locator("#practiceModeBtn").click();
    await page.locator("#homeStartBtn").click();
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            (0, eval)("Boolean(svgLoaded && gameState.currentTarget)"),
          ),
        { timeout: 15000 },
      )
      .toBe(true);
    await page.evaluate(
      (target) =>
        (0, eval)(`gameState.currentTarget = ${JSON.stringify(target)}`),
      name,
    );
    const point = await page.locator("#indiaMap").evaluate((node, pathId) => {
      const object = node as HTMLObjectElement;
      const doc = object.contentDocument!;
      const path = doc.getElementById(pathId) as unknown as SVGGeometryElement;
      const box = path.getBBox();
      const matrix = path.getScreenCTM()!;
      const rect = object.getBoundingClientRect();
      for (let y = 1; y < 40; y++)
        for (let x = 1; x < 40; x++) {
          const local = new DOMPoint(
            box.x + (box.width * x) / 40,
            box.y + (box.height * y) / 40,
          );
          if (path.isPointInFill(local)) {
            const screen = local.matrixTransform(matrix);
            return { x: rect.left + screen.x, y: rect.top + screen.y };
          }
        }
      throw new Error(`No interior point found for ${pathId}`);
    }, id);
    await page.mouse.click(point.x, point.y);
    await expect(page.locator("#progressLabel")).toContainText("1 /");
  });
}
