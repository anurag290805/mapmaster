import { expect, test } from "@playwright/test";

type LabMetrics = { cls: number; inp: number | null; lcp: number | null };

declare global {
  interface Window {
    __cp11LabMetrics?: LabMetrics;
  }
}

test("CP11 local lab records a stable critical journey without claiming field p75", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    const metrics = {
      cls: 0,
      inp: null as number | null,
      lcp: null as number | null,
    };
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries() as PerformanceEntry[]) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        };
        if (!shift.hadRecentInput) metrics.cls += shift.value || 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) metrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    try {
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          const duration =
            (entry as PerformanceEntry & { duration?: number }).duration || 0;
          metrics.inp = Math.max(metrics.inp || 0, duration);
        }
      }).observe({ type: "event", buffered: true } as PerformanceObserverInit);
    } catch {
      // Event timing is optional in local automation. Do not mistake absence
      // of browser support for an interaction error or field INP evidence.
    }
    Object.assign(window, { __cp11LabMetrics: metrics });
  });

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
  await page.locator("nav").getByRole("button", { name: "Play" }).click();
  await page.locator(".play-card[data-mode='typing']").click();
  await page.locator("#worldScopeBtn").click();
  await page.locator("#practiceModeBtn").click();
  const startedAt = await page.evaluate(() => performance.now());
  await page.locator("#homeStartBtn").click();
  await expect(page.locator("#gameScreen")).toBeVisible();
  const gameStartMs = await page.evaluate(
    (started) => performance.now() - started,
    startedAt,
  );
  await page.waitForTimeout(100);
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    return {
      ...window.__cp11LabMetrics,
      domContentLoaded: navigation?.domContentLoadedEventEnd || null,
    };
  });
  console.log("CP11 local-lab", JSON.stringify({ gameStartMs, ...metrics }));
  expect(pageErrors).toEqual([]);
  expect(metrics.cls).toBeLessThanOrEqual(0.1);
  expect(gameStartMs).toBeGreaterThan(0);
});
