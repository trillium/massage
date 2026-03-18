import { test, expect } from '@playwright/test'

type PerfMetrics = { error?: string; longestTask: number; maxFrameGap: number }

const MAX_LONG_TASK_MS = 200
const MAX_FRAME_GAP_MS = 100
const SETTLE_TIME = 2000

function perfScript(selector: string) {
  return `
    (async () => {
      const el = document.querySelector('${selector}');
      if (!el) return { error: 'not found: ${selector}' };

      const longTasks = [];
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) longTasks.push(entry.duration);
      });
      obs.observe({ type: 'longtask', buffered: false });

      const frames = [];
      let measuring = true;
      const tick = () => { frames.push(performance.now()); if (measuring) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);

      el.click();
      await new Promise(r => setTimeout(r, ${SETTLE_TIME}));
      measuring = false;
      obs.disconnect();

      let maxGap = 0;
      for (let i = 1; i < frames.length; i++) {
        const gap = frames[i] - frames[i - 1];
        if (gap > maxGap) maxGap = gap;
      }

      return {
        longTaskCount: longTasks.length,
        totalBlocked: Math.round(longTasks.reduce((s, d) => s + d, 0)),
        longestTask: Math.round(Math.max(0, ...longTasks)),
        maxFrameGap: Math.round(maxGap),
      };
    })()
  `
}

test.describe('Page Performance', () => {
  test.describe('Public pages load without errors', () => {
    const pages = [
      { path: '/', name: 'Home' },
      { path: '/landing', name: 'Landing' },
      { path: '/book', name: 'Book' },
      { path: '/display', name: 'Display' },
      { path: '/about', name: 'About' },
      { path: '/pricing', name: 'Pricing' },
      { path: '/services', name: 'Services' },
      { path: '/contact', name: 'Contact' },
      { path: '/faq', name: 'FAQ' },
      { path: '/reviews', name: 'Reviews' },
    ]

    for (const { path, name } of pages) {
      test(`${name} (${path}) loads without console errors`, async ({ page }) => {
        const errors: string[] = []
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(msg.text())
        })
        page.on('pageerror', (err) => errors.push(err.message))

        const response = await page.goto(path)
        await page.waitForLoadState('domcontentloaded')

        expect(response?.status()).toBeLessThan(400)

        const filtered = errors.filter(
          (e) =>
            !e.includes('favicon') &&
            !e.includes('hydration') &&
            !e.includes('Content Security Policy')
        )
        expect(filtered).toEqual([])
      })
    }
  })

  test.describe('/book duration switching', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/book')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    })

    const durations = ['60', '90', '120', '150']

    for (const dur of durations) {
      test(`switching to ${dur}m has no long tasks`, async ({ page }) => {
        const metrics = (await page.evaluate(
          perfScript(`label[for="duration-${dur}"]`)
        )) as PerfMetrics

        if (metrics.error) {
          test.skip(true, metrics.error)
          return
        }

        expect(metrics.longestTask).toBeLessThanOrEqual(MAX_LONG_TASK_MS)
        expect(metrics.maxFrameGap).toBeLessThanOrEqual(MAX_FRAME_GAP_MS)
      })
    }
  })

  test.describe('/display duration switching', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/display')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    })

    const durations = ['5', '10', '15', '20', '25', '30']

    for (const dur of durations) {
      test(`switching to ${dur}m has no long tasks`, async ({ page }) => {
        const metrics = (await page.evaluate(
          perfScript(`label[for="duration-${dur}"]`)
        )) as PerfMetrics

        if (metrics.error) {
          test.skip(true, metrics.error)
          return
        }

        expect(metrics.longestTask).toBeLessThanOrEqual(MAX_LONG_TASK_MS)
        expect(metrics.maxFrameGap).toBeLessThanOrEqual(MAX_FRAME_GAP_MS)
      })
    }
  })

  test.describe('/book date selection', () => {
    test('clicking a date has no long tasks', async ({ page }) => {
      await page.goto('/book')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const labelFor = (await page.evaluate(`
        (() => {
          const labels = [...document.querySelectorAll('label[for^="day-"]')];
          const enabled = labels.find(l => {
            const input = document.getElementById(l.getAttribute('for'));
            return input && !input.disabled;
          });
          return enabled ? 'label[for="' + enabled.getAttribute('for') + '"]' : null;
        })()
      `)) as string | null

      if (!labelFor) {
        test.skip(true, 'no enabled dates')
        return
      }

      const metrics = (await page.evaluate(perfScript(labelFor))) as PerfMetrics

      if (metrics.error) {
        test.skip(true, metrics.error)
        return
      }

      expect(metrics.longestTask).toBeLessThanOrEqual(MAX_LONG_TASK_MS)
      expect(metrics.maxFrameGap).toBeLessThanOrEqual(MAX_FRAME_GAP_MS)
    })
  })

  test.describe('/faq accordion', () => {
    test('expanding FAQ items has no long tasks', async ({ page }) => {
      await page.goto('/faq')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const btn = page.locator('button[aria-expanded]').first()
      if (!(await btn.isVisible())) {
        test.skip(true, 'no FAQ buttons')
        return
      }

      const metrics = (await page.evaluate(perfScript('button[aria-expanded]'))) as PerfMetrics

      if (metrics.error) {
        test.skip(true, metrics.error)
        return
      }

      expect(metrics.longestTask).toBeLessThanOrEqual(MAX_LONG_TASK_MS)
      expect(metrics.maxFrameGap).toBeLessThanOrEqual(MAX_FRAME_GAP_MS)
    })
  })
})
