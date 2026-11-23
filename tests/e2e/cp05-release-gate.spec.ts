import { test, expect, type Page } from "@playwright/test";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

test.use({ hasTouch: true, viewport: { width: 1100, height: 850 } });
async function ready(page: Page) {
  await page.goto("./pilot/world/");
  await expect(page.locator("#feedback")).toHaveText("Map ready.", {
    timeout: 30000,
  });
}
async function point(page: Page, code: string, radius = 0) {
  return page.locator(`#country-${code}`).evaluate((group, radius) => {
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
          const px = Math.round(screen.x),
            py = Math.round(screen.y);
          const offsets = radius ? [-radius, 0, radius] : [0];
          if (
            offsets.every((dx) =>
              offsets.every(
                (dy) =>
                  document
                    .elementFromPoint(px + dx, py + dy)
                    ?.closest("g[data-entity]") === group,
              ),
            )
          )
            return { x: px, y: py };
        }
    }
    throw new Error(`No integer hit point for ${group.id}`);
  }, radius);
}
test("representative real mouse, touch and gestures retain target identity", async ({
  page,
  baseURL,
}) => {
  test.skip(!baseURL?.includes("4174"), "Candidate is development-only.");
  test.setTimeout(120000);
  await ready(page);
  const original = await point(page, "BR");
  await page.mouse.click(original.x, original.y);
  await expect(page.locator("#feedback")).toContainText(
    "Brazil is not the current target",
  );
  const countries = [
    ["CA", "Canada"],
    ["JP", "Japan"],
    ["ZA", "South Africa"],
    ["AU", "Australia"],
    ["IN", "India"],
  ] as const;
  for (const [code, name] of countries) {
    await page.selectOption("#answer", `iso3166-1:${code}`);
    await page.locator("#focus-country").click();
    const p = await point(page, code);
    await page.mouse.click(p.x, p.y);
    await expect(page.locator("#feedback")).toContainText(
      `${name} is not the current target`,
    );
  }
  const before = await page.locator("#score").textContent();
  await page.locator("#reset").click();
  await page.locator("#zoom-in").click();
  await page.locator("#viewport").scrollIntoViewIfNeeded();
  const box = (await page.locator("#viewport svg").boundingBox())!;
  const transform = await page
    .locator("#candidate-layer")
    .getAttribute("transform");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 30,
    box.y + box.height / 2 + 15,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(page.locator("#candidate-layer")).not.toHaveAttribute(
    "transform",
    transform!,
  );
  await expect(page.locator("#score")).toHaveText(before!);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.selectOption("#answer", "iso3166-1:JP");
  await page.locator("#focus-country").click();
  const touch = await point(page, "JP");
  await page.touchscreen.tap(touch.x, touch.y);
  await expect(page.locator("#feedback")).toContainText(
    "Japan is not the current target",
  );
  await page.selectOption("#answer", "iso3166-1:VA");
  await page.locator("#focus-country").click();
  await page.locator('#answer-form button[type="submit"]').click();
  await expect(page.locator("#feedback")).toContainText(
    "Vatican City is not the current target",
  );
});
test("prepared adapter delegates active-document clicks without owning session state", async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL?.includes("4174"),
    "Adapter is not enabled in production.",
  );
  test.setTimeout(120000);
  await ready(page);
  await page.evaluate(async () => {
    const moduleUrl: string = "/js/world-map-adapter.mjs";
    const { createCandidateAdapter } = await import(moduleUrl);
    const manifest = await (
      await fetch("/candidate/world-manifest.json")
    ).json();
    const state = window as unknown as {
      adapterSession: string;
      adapterNames: string[];
      candidateAdapter: { dispose: () => void };
    };
    state.adapterSession = "s1";
    state.adapterNames = [];
    state.candidateAdapter = createCandidateAdapter(
      manifest,
      manifest.entities.map((e: { display_name: string }) => e.display_name),
      () => state.adapterSession,
    );
    (
      state.candidateAdapter as unknown as {
        activate: (d: Document, s: string, cb: (n: string) => void) => void;
      }
    ).activate(document, "s1", (name) => state.adapterNames.push(name));
  });
  let p = await point(page, "BR");
  await page.mouse.click(p.x, p.y);
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { adapterNames: string[] }).adapterNames,
      ),
    )
    .toEqual(["Brazil"]);
  await page.evaluate(() => {
    (window as unknown as { adapterSession: string }).adapterSession = "s2";
  });
  p = await point(page, "BR");
  await page.mouse.click(p.x, p.y);
  expect(
    await page.evaluate(
      () => (window as unknown as { adapterNames: string[] }).adapterNames,
    ),
  ).toEqual(["Brazil"]);
  await page.evaluate(() =>
    (
      window as unknown as { candidateAdapter: { dispose: () => void } }
    ).candidateAdapter.dispose(),
  );
});
test("original versus lossless serialization under the same local browser conditions", async ({
  page,
  baseURL,
}) => {
  test.skip(!baseURL?.includes("4174"), "Candidate is development-only.");
  test.setTimeout(180000);
  const dir = mkdtempSync(join(tmpdir(), "mapmaster-rc-"));
  try {
    const output = join(dir, "optimized.svg");
    execFileSync(process.execPath, [
      "tools/optimize-world-candidate.mjs",
      "candidate/world.svg",
      output,
    ]);
    const variants = [
      ["original", readFileSync("candidate/world.svg")],
      ["optimized", readFileSync(output)],
    ] as const;
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [name, body] of variants) {
      await page.route("**/candidate/world.svg", (route) =>
        route.fulfill({ contentType: "image/svg+xml", body }),
      );
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Performance.enable");
      const before = await cdp.send("Performance.getMetrics");
      const start = Date.now();
      await ready(page);
      const initial = Date.now() - start;
      const replacements: number[] = [];
      for (let i = 0; i < 2; i++) {
        const t = Date.now();
        await page.locator("#reload").click();
        await expect(page.locator("#feedback")).toHaveText("Map ready.", {
          timeout: 30000,
        });
        replacements.push(Date.now() - t);
      }
      const action = Date.now();
      for (let i = 0; i < 3; i++) {
        await page.locator("#zoom-in").click();
        await page.locator("#pan-right").click();
      }
      const controls = Date.now() - action;
      await cdp.send("HeapProfiler.collectGarbage");
      const heap = (await cdp.send("Runtime.getHeapUsage")).usedSize;
      const after = await cdp.send("Performance.getMetrics");
      const metric = (list: { name: string; value: number }[], key: string) =>
        list.find((m) => m.name === key)?.value ?? 0;
      console.log(
        `RC ${name}: bytes=${body.length} ready_ms=${initial} reload_ms=${replacements.join(",")} controls_ms=${controls} js_heap=${heap} task_cpu_s=${(metric(after.metrics, "TaskDuration") - metric(before.metrics, "TaskDuration")).toFixed(3)} layout_s=${(metric(after.metrics, "LayoutDuration") - metric(before.metrics, "LayoutDuration")).toFixed(3)} style_s=${(metric(after.metrics, "RecalcStyleDuration") - metric(before.metrics, "RecalcStyleDuration")).toFixed(3)}`,
      );
      await page.unroute("**/candidate/world.svg");
      await cdp.detach();
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
