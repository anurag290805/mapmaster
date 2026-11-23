import { expect, test, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";

type Entity = { canonical_id: string; display_name: string; dom_id: string };
const entities: Entity[] = JSON.parse(
  readFileSync("candidate/world-manifest.json", "utf8"),
).entities;
test.use({ hasTouch: true, viewport: { width: 1100, height: 850 } });
async function open(page: Page) {
  await page.goto("./pilot/world/");
  await expect(page.locator("#feedback")).toHaveText("Map ready.", {
    timeout: 30000,
  });
}
async function point(page: Page, code: string, ordinal = 0) {
  return page.locator(`#country-${code}`).evaluate((group, wanted) => {
    let found = 0;
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
          if (!path.isPointInFill(p)) continue;
          const screen = p.matrixTransform(path.getScreenCTM()!);
          const xPixel = Math.round(screen.x),
            yPixel = Math.round(screen.y);
          if (document.elementFromPoint(xPixel, yPixel) === path) {
            if (found++ === wanted) return { x: xPixel, y: yPixel };
            y = 20;
            break;
          }
        }
    }
    throw new Error(`No hit-tested point for ${group.id}, component ${wanted}`);
  }, ordinal);
}
test("all candidate identities are selectable without cross-country scoring", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "The candidate harness is development-only.",
  );
  test.setTimeout(240000);
  const start = Date.now();
  await open(page);
  const ready = Date.now() - start;
  await expect(page.locator("#countries > g[data-entity]")).toHaveCount(194);
  await expect(page.locator("#context")).toHaveAttribute(
    "pointer-events",
    "none",
  );
  await expect(page.locator("#country-AF")).toHaveAttribute(
    "aria-label",
    "Map target 1",
  );
  const wrong = await point(page, "BR");
  await page.mouse.click(wrong.x, wrong.y);
  await expect(page.locator("#score")).toHaveText("Score 0 · Attempts 1");
  const correct = await point(page, "AF");
  const selectionStart = Date.now();
  await page.mouse.click(correct.x, correct.y);
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 2");
  const selection = Date.now() - selectionStart;
  await page.selectOption("#answer", "iso3166-1:BR");
  await page.locator('#answer-form button[type="submit"]').click();
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 3");
  await page.locator("#country-AL").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#score")).toHaveText("Score 2 · Attempts 4");
  for (const [offset, e] of entities.slice(2).entries()) {
    await expect(page.locator("#target")).toHaveText(e.display_name);
    const incorrect = entities[(offset + 3) % entities.length];
    await page.selectOption("#answer", incorrect.canonical_id);
    await page.locator('#answer-form button[type="submit"]').click();
    await expect(page.locator("#feedback")).toHaveText(
      `${incorrect.display_name} is not the current target. Try again.`,
    );
    await expect(page.locator("#score")).toHaveText(
      `Score ${offset + 2} · Attempts ${offset * 2 + 5}`,
    );
    await page.selectOption("#answer", e.canonical_id);
    await page.locator('#answer-form button[type="submit"]').click();
    await expect(page.locator("#feedback")).toHaveText(
      `Correct: ${e.display_name}.`,
    );
    await expect(page.locator("#score")).toHaveText(
      `Score ${offset + 3} · Attempts ${offset * 2 + 6}`,
    );
  }
  await expect(page.locator("#target")).toHaveText("Complete");
  console.log(
    `CANDIDATE metrics: ready_ms=${ready} pointer_selection_ms=${selection} chooser_correct=192 keyboard_correct=1 mouse_correct=1 wrong_selections=194`,
  );
});
test("touch, view controls, tiny target fallback, review and replacement ownership", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "The candidate harness is development-only.",
  );
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  const start = Date.now();
  await open(page);
  const ready = Date.now() - start;
  const p = await point(page, "AF");
  await page.touchscreen.tap(p.x, p.y);
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 1");
  await page.selectOption("#answer", "iso3166-1:VA");
  await page.locator("#focus-country").click();
  await expect(page.locator("#feedback")).toHaveText(
    "Map focused on Vatican City.",
  );
  await expect(page.locator("#candidate-layer")).toHaveAttribute(
    "transform",
    /scale\(5\)/,
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.activeElement?.getAttribute("data-canonical-id"),
      ),
    )
    .toBe("iso3166-1:VA");
  for (const code of ["KI", "MV", "MH", "MC", "SC", "TV"]) {
    await page.selectOption("#answer", `iso3166-1:${code}`);
    await page.locator("#focus-country").click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement?.getAttribute("data-canonical-id"),
        ),
      )
      .toBe(`iso3166-1:${code}`);
  }
  await page.locator("#review").click();
  await page.locator('#answer-form button[type="submit"]').click();
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 1");
  await page.locator("#review").click();
  await page.locator("#reset").click();
  await expect(page.locator("#candidate-layer")).toHaveAttribute(
    "transform",
    "translate(0 0) scale(1)",
  );
  const actions = Date.now();
  for (let i = 0; i < 3; i++) {
    await page.locator("#zoom-in").click();
    await page.locator("#pan-right").click();
  }
  const controls = Date.now() - actions;
  await page.evaluate(() => {
    (window as unknown as { old: Element | null }).old =
      document.querySelector("#country-AL");
  });
  const replace = Date.now();
  await page.locator("#reload").click();
  await expect(page.locator("#feedback")).toHaveText("Map ready.", {
    timeout: 30000,
  });
  const reload = Date.now() - replace;
  await page.evaluate(() => {
    (window as unknown as { old: Element }).old.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
  });
  await expect(page.locator("#score")).toHaveText("Score 1 · Attempts 1");
  await page.locator("#new-session").click();
  await expect(page.locator("#feedback")).toHaveText("Map ready.", {
    timeout: 30000,
  });
  await expect(page.locator("#score")).toHaveText("Score 0 · Attempts 0");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  console.log(
    `CANDIDATE mobile metrics: ready_ms=${ready} reload_ms=${reload} six_view_actions_ms=${controls}`,
  );
});
test("candidate and pilot remain excluded from production", async ({
  baseURL,
  request,
}) => {
  if (baseURL?.includes("4174")) return;
  expect(existsSync("dist/candidate")).toBe(false);
  expect(existsSync("dist/pilot")).toBe(false);
  const response = await request.get("./pilot/world/");
  expect(await response.text()).not.toContain("World candidate validation");
});

test("stale responses and navigation cannot replace the active candidate", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "The candidate harness is development-only.",
  );
  test.setTimeout(120000);
  const svg = readFileSync("candidate/world.svg", "utf8");
  const script = readFileSync("pilot/world/candidate.mjs", "utf8");
  const marker =
    "const text=await response.text();if(!owner.current(token))return;";
  expect(script).toContain(marker);
  await page.route("**/pilot/world/candidate.mjs", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: script.replace(
        marker,
        "const text=await response.text();window.__candidateReads=(window.__candidateReads||0)+1;if(!owner.current(token))return;",
      ),
    }),
  );
  let release!: () => void, observed!: () => void;
  const hold = new Promise<void>((r) => {
    release = r;
  });
  const seen = new Promise<void>((r) => {
    observed = r;
  });
  let releaseThird!: () => void, observedThird!: () => void;
  const holdThird = new Promise<void>((r) => {
    releaseThird = r;
  });
  const seenThird = new Promise<void>((r) => {
    observedThird = r;
  });
  let requestCount = 0;
  await page.route("**/candidate/world.svg", async (route) => {
    requestCount++;
    const index = requestCount;
    if (index === 1) {
      observed();
      await hold;
    }
    if (index === 3) {
      observedThird();
      await holdThird;
    }
    await route
      .fulfill({
        contentType: "image/svg+xml",
        body: svg.replace("<svg ", `<svg data-request="${index}" `),
      })
      .catch((error) => {
        if (index !== 3) throw error;
      });
  });
  await page.goto("./pilot/world/", { waitUntil: "domcontentloaded" });
  await seen;
  await page.locator("#reload").click();
  await expect(page.locator("#viewport svg")).toHaveAttribute(
    "data-request",
    "2",
    { timeout: 30000 },
  );
  release();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { __candidateReads: number }).__candidateReads,
      ),
    )
    .toBe(2);
  await expect(page.locator("#viewport svg")).toHaveAttribute(
    "data-request",
    "2",
  );
  await page.locator("#review").click();
  await page.locator("#reload").click();
  await seenThird;
  await page.goto("./pilot/");
  releaseThird();
  await expect(page.locator("#feedback")).toHaveText("Map ready.");
});

test("repeat loads expose JavaScript heap samples after garbage collection", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "The candidate harness is development-only.",
  );
  test.setTimeout(120000);
  await open(page);
  const cdp = await page.context().newCDPSession(page);
  const samples: number[] = [];
  for (let i = 0; i < 4; i++) {
    await cdp.send("HeapProfiler.collectGarbage");
    const usage = await cdp.send("Runtime.getHeapUsage");
    samples.push(usage.usedSize);
    if (i < 3) {
      await page.locator("#reload").click();
      await expect(page.locator("#feedback")).toHaveText("Map ready.", {
        timeout: 30000,
      });
    }
  }
  await expect(page.locator("#viewport svg")).toHaveCount(1);
  console.log(
    `CANDIDATE JS heap bytes after GC: ${samples.join(",")}; excludes native rendering and browser process memory`,
  );
});

test("multipart countries resolve separate real pointer hits to one identity", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "The candidate harness is development-only.",
  );
  test.setTimeout(120000);
  await open(page);
  const index = entities.findIndex((e) => e.canonical_id === "iso3166-1:CA");
  for (const e of entities.slice(0, index)) {
    await page.selectOption("#answer", e.canonical_id);
    await page.locator('#answer-form button[type="submit"]').click();
  }
  await expect(page.locator("#target")).toHaveText("Canada");
  const first = await point(page, "CA"),
    second = await point(page, "CA", 1);
  await page.mouse.click(first.x, first.y);
  await expect(page.locator("#feedback")).toHaveText("Correct: Canada.");
  await page.mouse.click(second.x, second.y);
  await expect(page.locator("#feedback")).toHaveText(
    "Canada is not the current target. Try again.",
  );
  await expect(page.locator("#score")).toHaveText(
    `Score ${index + 1} · Attempts ${index + 2}`,
  );
});
