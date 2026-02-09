# Lighthouse Audit Report

**URL:** https://trilliummassage.la/
**Date:** 2026-02-09
**Lighthouse Version:** 12.8.2
**Form Factor:** Mobile (simulated throttling)

## Category Scores

| Category | Score |
|----------|-------|
| Performance | 73 |
| Accessibility | 96 |
| Best Practices | 93 |
| SEO | 100 |

## Core Web Vitals & Performance Metrics

| Metric | Value | Score |
|--------|-------|-------|
| First Contentful Paint (FCP) | 1.8 s | 89 |
| Largest Contentful Paint (LCP) | 5.1 s | 24 |
| Total Blocking Time (TBT) | 310 ms | 77 |
| Cumulative Layout Shift (CLS) | 0 | 100 |
| Speed Index | 2.8 s | 96 |
| Time to Interactive (TTI) | 5.9 s | 66 |

## Key Issues

### Critical: Largest Contentful Paint (5.1 s)

The LCP element is a hero image (`<img alt="Massage therapy session">`). Breakdown:

| Phase | Time | % of LCP |
|-------|------|----------|
| TTFB | 724 ms | 14% |
| Load Delay | 2,138 ms | 42% |
| Load Time | 1,143 ms | 22% |
| Render Delay | 1,140 ms | 22% |

**Recommendations:**
- Preload the LCP image (`<link rel="preload">` or Next.js `priority` prop)
- Reduce load delay — the image is not discovered until late in the waterfall
- Consider smaller initial image dimensions for mobile

### Reduce Unused JavaScript (est. savings 301 KiB)

Top offenders:

| Resource | Wasted |
|----------|--------|
| `ef7998e1-f5264ebbf7bdae4d.js` | 63 KiB |
| `posthog-recorder.js` (PostHog) | 62 KiB |
| `5202-75992e6e1801adc8.js` | 43 KiB |
| `6184-d59ccdd6411ed8a2.js` | 37 KiB |
| `6329-2b3a4ab37799fd2d.js` | 25 KiB |

**Recommendations:**
- Lazy-load PostHog recorder (only needed after user interaction)
- Audit chunk splitting — code-split routes and heavy components

### Document Request Latency (est. savings 520 ms)

The initial HTML document takes too long to arrive. Consider:
- Edge caching / CDN for the HTML response
- Reviewing server-side rendering overhead

### Console Errors (CSP Violation)

Umami analytics script (`cloud.umami.is/script.js`) blocked by Content Security Policy. The CSP `script-src` allows `analytics.umami.is` but the script loads from `cloud.umami.is`.

**Fix:** Update CSP header to allow `cloud.umami.is` or update the Umami script URL to use `analytics.umami.is`.

### Color Contrast (Accessibility)

11 elements have insufficient contrast ratios:
- `bg-primary-600` buttons/links (e.g., "Book" CTA, pricing buttons)
- `text-primary-600` outlined links
- `text-gray-500` descriptive text
- `bg-primary-500` badge/pill elements

**Fix:** Darken `primary-600`/`primary-500` or lighten text/background to meet WCAG AA (4.5:1 for normal text, 3:1 for large text).

## Warnings

| Audit | Details |
|-------|---------|
| Cache policy | 3 PostHog resources with short TTLs (5 min to 4 hrs) |
| Render-blocking resources | Potential savings from deferring resources |
| Properly size images | Est. savings of 30 KiB |
| Legacy JavaScript | Est. savings of 43 KiB — polyfills served to modern browsers |
| Duplicated JavaScript | Est. savings of 4 KiB |

## Passing Audits

80 audits passed, including:
- HTTPS, HTTP/2, text compression
- Valid doctype, charset, viewport meta
- Image alt attributes, valid ARIA, semantic HTML
- Meta description, crawlable links, valid robots.txt, canonical URL
- No `document.write()`, passive listeners, no geolocation on load

## Summary

The site scores well across accessibility (96), best practices (93), and SEO (100). The main area for improvement is **performance (73)**, driven primarily by a slow LCP (5.1 s). The highest-impact fixes are:

1. **Preload the hero image** to cut LCP load delay (42% of LCP time)
2. **Lazy-load PostHog recorder** to reduce unused JS
3. **Fix CSP for Umami** to eliminate console errors
4. **Improve color contrast** on primary-colored elements for full WCAG compliance
