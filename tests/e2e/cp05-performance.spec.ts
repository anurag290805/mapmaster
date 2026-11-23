import { expect, test } from "@playwright/test";

test("measure visible map switching to interactivity", async ({
  page,
}, testInfo) => {
  await page.route("https://**/*", (route) => route.abort());
  await page.goto("./");
  await page.evaluate(() => (0, eval)('showScreen("game")'));
  const samples: number[] = [];
  for (const key of ["india", "world", "india", "world"]) {
    await page.evaluate(
      (selection) =>
        (0, eval)(
          `window.cp05Start = performance.now(); applyMap(${JSON.stringify(selection)})`,
        ),
      key,
    );
    await expect
      .poll(
        () =>
          page.evaluate(
            (selection) =>
              (0, eval)(
                `Boolean(svgLoaded && getSvgDoc()?.URL.endsWith('/svg/${selection}.svg'))`,
              ),
            key,
          ),
        { timeout: 15000 },
      )
      .toBe(true);
    samples.push(
      await page.evaluate(
        () =>
          performance.now() -
          (window as unknown as { cp05Start: number }).cp05Start,
      ),
    );
  }
  console.log(
    `${testInfo.project.name} map readiness milliseconds: ${samples.map((n) => n.toFixed(1)).join(", ")}`,
  );
});
