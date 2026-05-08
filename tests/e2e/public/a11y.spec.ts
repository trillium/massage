import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const KEY_PAGES = ['/', '/booking', '/about']

for (const path of KEY_PAGES) {
  test(`@a11y ${path} has no critical accessibility violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )

    if (critical.length > 0) {
      const summary = critical.map(
        (v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`
      )
      expect(critical, `A11y violations on ${path}:\n${summary.join('\n')}`).toHaveLength(0)
    }
  })
}
