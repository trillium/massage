import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PROPOSAL_URL = '/dental-exchange/proposal?token=dental-exchange-2026'
const SCHEMES = ['light', 'dark'] as const
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 800 },
]

for (const scheme of SCHEMES) {
  for (const viewport of VIEWPORTS) {
    test(`@a11y dental proposal has no color-contrast violations (${scheme}, ${viewport.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.emulateMedia({ colorScheme: scheme })
      await page.goto(PROPOSAL_URL, { waitUntil: 'networkidle' })
      await page.evaluate(
        (isDark) => document.documentElement.classList.toggle('dark', isDark),
        scheme === 'dark'
      )

      const results = await new AxeBuilder({ page })
        .include('[data-proposal]')
        .withRules(['color-contrast'])
        .analyze()

      const summary = results.violations.flatMap((v) =>
        v.nodes.map((n) => `${n.target.join(' ')}: ${n.any[0]?.message ?? v.help}`)
      )
      expect(summary, summary.join('\n')).toHaveLength(0)
    })
  }
}
