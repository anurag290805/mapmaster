import { expect, test, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

test.use({ hasTouch: true, viewport: { width: 1100, height: 850 } });
async function openPilot(page: Page) {
  await page.goto("./pilot/");
  await expect(page.locator("#feedback")).toHaveText("Map ready.");
}
async function hitPoint(page: Page, code: string, ordinal = 0) {
  return page.locator(`#country-${code}`).evaluate((group, wanted) => {
    let matched = 0;
    const svg = (group as SVGElement).ownerSVGElement!;
    const paths = [...group.querySelectorAll("path")].sort((a, b) => {
      const x = a.getBBox(),
        y = b.getBBox();
      return y.width * y.height - x.width * x.height;
    });
    for (const path of paths) {
      const b = path.getBBox();
      for (let y = 1; y < 20; y++)
        for (let x = 1; x < 20; x++) {
          const p = svg.createSVGPoint();
          p.x = b.x + (b.width * x) / 20;
          p.y = b.y + (b.height * y) / 20;
          if (path.isPointInFill(p)) {
            const p2 = p.matrixTransform(path.getScreenCTM()!);
            const r = svg.getBoundingClientRect();
            if (
              p2.x >= r.left &&
              p2.x <= r.right &&
              p2.y >= r.top &&
              p2.y <= r.bottom
            ) {
              if (matched === wanted) return { x: p2.x, y: p2.y };
              matched++;
              y = 20;
              break;
            }
          }
        }
    }
    throw new Error(`No reachable point for ${group.id}, part ${wanted}`);
  }, ordinal);
}
test("isolated pilot scores pointer, keyboard and chooser interactions and excludes production", async ({
  page,
  request,
  baseURL,
}) => {
  if (!baseURL?.includes("4174")) {
    expect(existsSync("dist/pilot")).toBe(false);
    for (const path of [
      "./pilot/",
      "./pilot/pilot.mjs",
      "./pilot/manifest.json",
      "./pilot/map.svg",
    ]) {
      const response = await request.get(path);
      const content = await response.text();
      expect(content).not.toContain("World map pilot");
      expect(content).not.toContain("Pilot map of selected countries");
      expect(content).not.toContain("createOwner");
      expect(content).not.toContain("1159320467");
    }
    return;
  }
  const errors: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await openPilot(page);
  await expect(page.locator("g[data-entity]")).toHaveCount(8);
  expect(await page.locator("#country-CA").getAttribute("aria-label")).toBe(
    "Canada",
  );
  const wrong = await hitPoint(page, "BR");
  await page.mouse.click(wrong.x, wrong.y);
  await expect(page.locator("#score")).toHaveText("Score 0 · Attempts 1");
  const correct = await hitPoint(page, "CA");
  await page.mouse.click(correct.x, correct.y);
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 2");
  const anotherPart = await hitPoint(page, "CA", 1);
  await page.mouse.click(anotherPart.x, anotherPart.y);
  await expect(page.locator("#feedback")).toContainText(
    "Canada is not the current target",
  );
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 3");
  await page.locator("#country-BR").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#score")).toHaveText("Score 2 · Attempts 4");
  await expect(page.locator("#country-BR")).toBeFocused();
  await page.selectOption("#answer", "iso3166-1:JP");
  await page.locator("#answer-form button[type=submit]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#score")).toHaveText("Score 3 · Attempts 5");
  await expect(page.locator("#feedback")).toContainText("Correct: Japan");
  await expect(page.locator("#answer-form button[type=submit]")).toBeFocused();
  expect(errors).toEqual([]);
});
test("touch tap, viewport controls, bounded zoom and reset", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Pilot is development-only; preview isolation is checked separately.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await openPilot(page);
  const p = await hitPoint(page, "CA");
  await page.touchscreen.tap(p.x, p.y);
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 1");
  const layer = page.locator("#pilot-layer");
  for (let i = 0; i < 12; i++) await page.locator("#zoom-in").click();
  await expect(layer).toHaveAttribute("transform", /scale\(5\)/);
  const rect = (await page.locator("#viewport svg").boundingBox())!;
  const before = await layer.getAttribute("transform");
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    rect.x + rect.width / 2 + 35,
    rect.y + rect.height / 2 + 20,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(layer).not.toHaveAttribute("transform", before!);
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 1");
  await page.locator("#pan-right").click();
  await expect(layer).not.toHaveAttribute("transform", /^translate\(0 0\)/);
  await page.locator("#reset").click();
  await expect(layer).toHaveAttribute(
    "transform",
    "translate(0 0) translate(180 90) scale(1) translate(-180 -90)",
  );
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.wheel(0, -100);
  await expect(layer).toHaveAttribute("transform", /scale\(1\.2\)/);
  await page.locator("#reset").click();
  for (let i = 0; i < 8; i++) await page.locator("#zoom-out").click();
  await expect(layer).toHaveAttribute("transform", /scale\(1\)/);
  await page.setViewportSize({ width: 320, height: 700 });
  await expect(page.locator("#viewport")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("obsolete listener cannot score after replacement", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Pilot is development-only; preview isolation is checked separately.",
  );
  await openPilot(page);
  await page.evaluate(() => {
    (window as unknown as { oldPilot: Element | null }).oldPilot =
      document.querySelector("#country-CA");
  });
  await page.locator("#reload").click();
  await expect(page.locator("#feedback")).toHaveText("Map ready.");
  await page.evaluate(() => {
    (window as unknown as { oldPilot: Element }).oldPilot.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
  });
  await expect(page.locator("#score")).toHaveText("Score 0 · Attempts 0");
});
test("obsolete map response loses ownership; removing the generation guard exposes the race", async ({
  browser,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Pilot is development-only; preview isolation is checked separately.",
  );
  const original = readFileSync("pilot/map.svg", "utf8"),
    core = readFileSync("pilot/core.mjs", "utf8"),
    pilot = readFileSync("pilot/pilot.mjs", "utf8");
  const marker =
    "const text=await response.text();if(!owner.current(token))return;";
  expect(pilot).toContain(marker);
  expect(core).toContain("token === generation");
  for (const guarded of [true, false]) {
    const page = await browser.newPage();
    let release!: () => void, observed!: () => void;
    const hold = new Promise<void>((r) => {
      release = r;
    });
    const seen = new Promise<void>((r) => {
      observed = r;
    });
    let count = 0;
    await page.route("**/pilot/pilot.mjs", (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: pilot.replace(
          marker,
          "const text=await response.text();window.__pilotReadCount=(window.__pilotReadCount||0)+1;if(!owner.current(token))return;",
        ),
      }),
    );
    if (!guarded)
      await page.route("**/pilot/core.mjs", (route) =>
        route.fulfill({
          contentType: "text/javascript",
          body: core.replace("token === generation", "true"),
        }),
      );
    await page.route("**/pilot/map.svg", async (route) => {
      count++;
      const index = count;
      if (index === 1) {
        observed();
        await hold;
      }
      await route.fulfill({
        contentType: "image/svg+xml",
        body: original.replace("<svg ", `<svg data-request="${index}" `),
      });
    });
    await page.goto(`${baseURL}/pilot/`, { waitUntil: "domcontentloaded" });
    await seen;
    await page.locator("#reload").click();
    await expect(page.locator("#viewport svg")).toHaveAttribute(
      "data-request",
      "2",
    );
    release();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { __pilotReadCount: number })
              .__pilotReadCount,
        ),
      )
      .toBe(2);
    if (guarded) {
      await expect(page.locator("#viewport svg")).toHaveAttribute(
        "data-request",
        "2",
      );
    } else
      await expect(page.locator("#viewport svg")).toHaveAttribute(
        "data-request",
        "1",
      );
    await page.close();
  }
});

test("each fixture identity can be reached by an actual mouse action", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Pilot is development-only; preview isolation is checked separately.",
  );
  await openPilot(page);
  for (const [index, code] of [
    "CA",
    "BR",
    "JP",
    "NZ",
    "PT",
    "MT",
    "ZA",
    "CV",
  ].entries()) {
    await page.selectOption("#answer", `iso3166-1:${code}`);
    await page.locator("#focus-country").click();
    const point = await hitPoint(page, code);
    await page.mouse.click(point.x, point.y);
    await expect(page.locator("#score")).toContainText(`Score ${index + 1} ·`);
  }
});

test("repeat replacement preserves session ownership and records readiness samples", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Pilot is development-only; preview isolation is checked separately.",
  );
  const start = Date.now();
  await openPilot(page);
  const initial = Date.now() - start;
  const samples: number[] = [];
  await page.evaluate(() => {
    (window as unknown as { oldNodes: Element[] }).oldNodes = [];
  });
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      (window as unknown as { oldNodes: Element[] }).oldNodes.push(
        document.querySelector("#country-CA")!,
      );
    });
    const t = Date.now();
    await page.locator("#reload").click();
    await expect(page.locator("#feedback")).toHaveText("Map ready.");
    samples.push(Date.now() - t);
  }
  await page.evaluate(() => {
    for (const node of (window as unknown as { oldNodes: Element[] }).oldNodes)
      node.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
  });
  await expect(page.locator("#score")).toHaveText("Score 0 · Attempts 0");
  const actionStart = Date.now();
  for (let i = 0; i < 3; i++) {
    await page.locator("#zoom-in").click();
    await page.locator("#pan-right").click();
  }
  const actions = Date.now() - actionStart;
  console.log(
    `Pilot readiness ms initial=${initial}, replacements=${samples.join(",")}; 6 zoom/pan button actions=${actions}`,
  );
  await expect(page.locator("#viewport svg")).toHaveCount(1);
  await expect(page.locator("g[data-entity]")).toHaveCount(8);
});
