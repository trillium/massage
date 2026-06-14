---
project: trilliummassage.la
task: Design System Enforcement System
slug: massage-ds-enforcement
effort: E3
phase: execute
progress: 0/38
mode: build
started: 2026-06-12
updated: 2026-06-12
---

# Design System Enforcement System — trilliummassage.la

## Problem

The trilliummassage.la codebase had no mechanism to prevent content or UI regressions. Bare JSX string literals were scattered across 638 locations — hardcoded text that bypassed the content layer, made LLM-assisted migrations impossible, and drifted silently across every new component. Separately, UI components like `<Button>`, `<Input>`, and `<GradientText>` existed in `components/ui/` but nothing stopped developers from writing raw `<button className=…>` instead. A `<GradientText>` component was entirely missing from the design system page and had no detection rule — a developer discovering the gradient pattern for the first time would re-implement it inline with no knowledge the component existed.

The three surfaces (content layer, DS component rules, design system documentation page) were disconnected and manually maintained. Each required remembering three separate places to update; nothing enforced consistency across them.

## Vision

A developer on trilliummassage.la cannot accidentally regress content or UI quality at the commit boundary. The pre-commit hook catches bare JSX strings, raw HTML elements that should be DS components, and DS components missing from the manifest — before the diff lands in git. When a developer types `<button className=`, the commit fails with a clear message pointing to `<Button>` and the design system page. When a new `components/ui/` file is added without a manifest entry, the commit fails with a coverage gap report. The design system page at `/design-system` is the canonical reference — every component in `components/ui/` appears there with a live example, import path, and the raw pattern it replaces. LLM migration agents can run `pnpm audit:content --summary` or `pnpm audit:ui --summary` to get a ranked violation list and drive batch migration autonomously.

## Out of Scope

- Visual regression testing (screenshot diffs across releases) — a separate Playwright concern
- Enforcing consistent spacing, color usage, or Tailwind class ordering — Biome's formatter handles formatting; this system handles component and content correctness
- Server-side rendering correctness or hydration warnings
- Enforcement inside `app/[bookingSlug]/designs/**` and `app/og-variants/**` — these OG image design files own their strings by design and are biome-exempt
- Automated migration of existing violations — audit scripts surface them; migration is a separate LLM-agent task

## Principles

- **Enforcement is only real when it blocks commits.** Audit scripts are visibility tools. Warnings are noise. Rules must be `error`, not `warn`, at the commit boundary.
- **Single source of truth per concern.** The manifest (`components/ui/manifest.ts`) owns all DS component rules. Both detection scripts and the design system page derive from it — no duplication, no drift.
- **Machine-readable output for LLM agents.** Audit scripts output JSON (`--reporter=json` compatible) so Haiku-tier agents can drive batch migration without parsing human-formatted text.
- **Detection rules must be self-exempting.** A component file that contains the raw pattern it replaces (e.g., `GradientText.tsx` uses `bg-clip-text`) must self-exempt with `/* ds-ignore-file */` so the rule doesn't block its own implementation.
- **Content layer is the safe zone.** Strings in `data/*.json` are the correct location for user-facing text. The biome rule enforces migration toward this zone, never away from it.

## Constraints

- TypeScript always, bun always — no Python, no bash parsers, no npm/npx
- biome is the lint authority — no parallel Python or bash string scanners
- `components/ui/manifest.ts` is the canonical DS rule source — detection scripts must import from it, not duplicate rules inline
- OG/design files (`app/[bookingSlug]/designs/**`, `app/og-variants/**`, `app/design-system/**`) are biome-exempt by policy — `check-brand-purity.ts` enforces they do not import `@/data`
- The pre-commit hook runs in lint-staged — any new check must integrate there

## Goal

Every bare JSX string literal and every raw HTML element that should be a DS component is caught at the commit boundary. The manifest at `components/ui/manifest.ts` is the single source of truth for all DS rules — detection scripts and the design system page both derive from it. Adding a new `components/ui/` component requires one manifest entry and nothing else to be enforced and documented.

## Criteria

### Content Layer (noJsxLiterals)

- [ ] ISC-1: `pnpm lint` exits 0 with no `noJsxLiterals` errors across `app/` and `components/`
- [ ] ISC-2: `bun scripts/audit-content.ts --summary` reports 0 violations across all `.tsx` files
- [ ] ISC-3: `biome.json` has `noJsxLiterals: "error"` (not `"warn"`)
- [ ] ISC-4: `biome.json` `overrides` array exempts OG/design/design-system paths from `noJsxLiterals`
- [ ] ISC-5: A newly staged file with a bare JSX text node fails `biome check` with exit code 1
- [ ] ISC-6: Anti: `noJsxLiterals` is NOT set to `"warn"` anywhere in `biome.json`

### DS Component Detection (manifest-driven)

- [ ] ISC-7: `components/ui/manifest.ts` exports a `DS_RULES` array typed as `DsRule[]`
- [ ] ISC-8: Every entry in `DS_RULES` has `name`, `component`, `importPath`, and at least one `patterns` entry
- [ ] ISC-9: `scripts/check-design-system.ts` imports `DS_RULES` from the manifest — no hardcoded rule arrays
- [ ] ISC-10: `scripts/audit-ui.ts` imports `DS_RULES` from the manifest — no hardcoded rule arrays
- [ ] ISC-11: `bun scripts/check-design-system.ts <file-with-raw-button>` exits 1 and names `<Button>`
- [ ] ISC-12: `bun scripts/audit-ui.ts --summary` reports violations only for files with raw patterns
- [ ] ISC-13: `GradientText.tsx` has `/* ds-ignore-file */` so it does not trigger its own `raw-gradient-text` rule
- [ ] ISC-14: Anti: detection rules are NOT duplicated between `manifest.ts` and any script file

### DS Coverage Check

- [ ] ISC-15: `scripts/check-ds-coverage.ts` exists and exits 0 when all `components/ui/*.tsx` files have a manifest entry
- [ ] ISC-16: `check-ds-coverage.ts` exits 1 with a gap report when a `components/ui/*.tsx` file has no manifest entry
- [ ] ISC-17: `pnpm audit:ds-coverage` is registered in `package.json`
- [ ] ISC-18: `check-ds-coverage.ts` runs in lint-staged on every `.tsx` commit
- [ ] ISC-19: Anti: a new `components/ui/Foo.tsx` file can NOT be committed without a manifest entry triggering the coverage check failure

### Brand Purity

- [ ] ISC-20: `bun scripts/check-brand-purity.ts <biome-exempt-file>` exits 1 if that file imports from `@/data`
- [ ] ISC-21: `check-brand-purity.ts` reads exempt paths from `biome.json` overrides — not hardcoded
- [ ] ISC-22: An OG design file that imports `@/data` fails the pre-commit hook

### Design System Page

- [ ] ISC-23: `GET /design-system` returns 200 with page content
- [ ] ISC-24: The page shows a live `<GradientText>` example with the default `accent → primary` gradient
- [ ] ISC-25: The page shows live examples for `<Button>`, `<Badge>`, `<Input>`, `<Textarea>`, `<GradientText>`
- [ ] ISC-26: The enforcement rules table on the page lists all patterns from `DS_RULES` in manifest
- [ ] ISC-27: The page imports and renders from `DS_RULES` — enforcement table is not a hardcoded array separate from the manifest
- [ ] ISC-28: Anti: the design system page does NOT import from `@/data` (it is biome-exempt and must own its strings)

### Audit Scripts (LLM-agent interface)

- [ ] ISC-29: `bun scripts/audit-content.ts` outputs valid JSON with `totalViolations`, `totalFiles`, `files[]`
- [ ] ISC-30: `bun scripts/audit-ui.ts` outputs valid JSON with the same shape
- [ ] ISC-31: Both audit scripts accept `--file <path>` for per-file targeted scans
- [ ] ISC-32: Both audit scripts accept `--summary` for human-readable table output
- [ ] ISC-33: `pnpm audit:content:summary` and `pnpm audit:ui:summary` are registered in `package.json`

### MobileNav Residual

- [ ] ISC-34: `components/MobileNav.tsx` has 0 `audit-ui` violations (raw button fixed or ignored with `// ds-ignore`)

### Production

- [ ] ISC-35: `curl https://trilliummassage.la/api/health` returns `"status": "ok"` or `"degraded"` with build SHA matching latest `main` commit
- [ ] ISC-36: `curl https://trilliummassage.la/rachel-birthday-2026/opengraph-image` returns HTTP 200 with `content-type: image/png`
- [ ] ISC-37: OG image at the Rachel birthday slug renders the `ai-from-2089` design (dark background, gold text)
- [ ] ISC-38: Anti: the OG image endpoint does NOT use `sharp` filesystem reads that fail in Vercel serverless — image source is a CDN URL

## Test Strategy

| ISC    | Type        | Check                                                                                                                           | Threshold                    | Tool        |
| ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------- | ----------------------------------------------- | ----- | ------- |
| ISC-1  | lint        | `pnpm lint` exit code                                                                                                           | 0                            | Bash        |
| ISC-2  | audit       | `bun scripts/audit-content.ts --summary` violation count                                                                        | 0                            | Bash        |
| ISC-3  | config      | `jq '.linter.rules.style.noJsxLiterals' biome.json`                                                                             | `"error"`                    | Bash/jq     |
| ISC-4  | config      | `jq '.overrides[0].linter.rules.style.noJsxLiterals' biome.json`                                                                | `"off"`                      | Bash/jq     |
| ISC-5  | integration | Stage a file with bare JSX text, run `biome check --staged`                                                                     | exit 1                       | Bash        |
| ISC-6  | config      | `grep -r '"warn"' biome.json` for noJsxLiterals                                                                                 | no match                     | Bash        |
| ISC-7  | code        | `grep 'export.*DS_RULES' components/ui/manifest.ts`                                                                             | match                        | Grep        |
| ISC-8  | code        | `bun -e "import {DS_RULES} from './components/ui/manifest.ts'; console.log(DS_RULES.every(r => r.name && r.patterns?.length))"` | `true`                       | Bash        |
| ISC-9  | code        | `grep 'from.*manifest' scripts/check-design-system.ts`                                                                          | match                        | Grep        |
| ISC-10 | code        | `grep 'from.*manifest' scripts/audit-ui.ts`                                                                                     | match                        | Grep        |
| ISC-11 | integration | Create temp file with `<button className=`, run check-design-system                                                             | exit 1                       | Bash        |
| ISC-12 | audit       | `bun scripts/audit-ui.ts --summary` output                                                                                      | accurate counts              | Bash        |
| ISC-13 | code        | `head -1 components/ui/GradientText.tsx`                                                                                        | contains `ds-ignore-file`    | Read        |
| ISC-14 | code        | `grep -r 'raw-button\|raw-input' scripts/` excluding manifest import                                                            | no hardcoded arrays          | Grep        |
| ISC-15 | integration | `bun scripts/check-ds-coverage.ts` with all ui/ covered                                                                         | exit 0                       | Bash        |
| ISC-16 | integration | Temporarily add uncovered ui/ file, run coverage check                                                                          | exit 1 + gap report          | Bash        |
| ISC-17 | config      | `jq '.scripts["audit:ds-coverage"]' package.json`                                                                               | defined                      | Bash/jq     |
| ISC-18 | config      | `jq '."lint-staged"."\*.+(js                                                                                                    | jsx                          | ts          | tsx)"' package.json`contains`check-ds-coverage` | match | Bash/jq |
| ISC-19 | integration | Stage new `components/ui/Uncovered.tsx`, attempt commit                                                                         | hook fails                   | Bash        |
| ISC-20 | integration | Run `check-brand-purity.ts` on a biome-exempt file with `@/data` import                                                         | exit 1                       | Bash        |
| ISC-21 | code        | `grep 'biome.json\|BIOME_PATH' scripts/check-brand-purity.ts`                                                                   | reads biome.json             | Read        |
| ISC-22 | integration | Stage OG design file importing `@/data`, attempt commit                                                                         | hook fails                   | Bash        |
| ISC-23 | http        | `curl -s http://localhost:9876/design-system`                                                                                   | 200                          | Bash        |
| ISC-24 | visual      | Interceptor screenshot of `/design-system`                                                                                      | GradientText section visible | Interceptor |
| ISC-25 | code        | `grep -n 'GradientText\|Button\|Badge\|Input\|Textarea' app/design-system/page.tsx`                                             | all 5 found                  | Grep        |
| ISC-26 | code        | DS page derives enforcement table from DS_RULES or equivalent                                                                   | no hardcoded separate array  | Read        |
| ISC-27 | code        | `grep 'manifest\|DS_RULES' app/design-system/page.tsx`                                                                          | imports manifest             | Grep        |
| ISC-28 | code        | `grep "@/data" app/design-system/page.tsx`                                                                                      | no match                     | Grep        |
| ISC-29 | output      | `bun scripts/audit-content.ts \| jq '.totalViolations'`                                                                         | integer                      | Bash/jq     |
| ISC-30 | output      | `bun scripts/audit-ui.ts \| jq '.totalViolations'`                                                                              | integer                      | Bash/jq     |
| ISC-31 | integration | `bun scripts/audit-content.ts --file app/contact/page.tsx`                                                                      | per-file output              | Bash        |
| ISC-32 | integration | `bun scripts/audit-content.ts --summary`                                                                                        | table output                 | Bash        |
| ISC-33 | config      | `jq '.scripts["audit:content:summary"]' package.json`                                                                           | defined                      | Bash/jq     |
| ISC-34 | audit       | `bun scripts/audit-ui.ts --file components/MobileNav.tsx`                                                                       | 0 violations                 | Bash        |
| ISC-35 | http        | `curl -s https://trilliummassage.la/api/health \| jq '.build.sha'`                                                              | latest main SHA              | Bash        |
| ISC-36 | http        | `curl -sI https://trilliummassage.la/rachel-birthday-2026/opengraph-image`                                                      | 200 + image/png              | Bash        |
| ISC-37 | visual      | Screenshot of OG image                                                                                                          | dark background, gold text   | Read image  |
| ISC-38 | code        | `grep 'sharp\|readFile.*public' app/\[bookingSlug\]/opengraph-image.tsx`                                                        | no match                     | Grep        |

## Features

| Name               | Description                                                             | Satisfies | Depends On                 | Parallelizable |
| ------------------ | ----------------------------------------------------------------------- | --------- | -------------------------- | -------------- |
| content-layer      | biome noJsxLiterals:error + all 638 violations migrated to data/\*.json | ISC-1–6   | —                          | no             |
| ds-manifest        | `components/ui/manifest.ts` as single source of truth for DS rules      | ISC-7–8   | —                          | no             |
| detection-scripts  | check-design-system.ts + audit-ui.ts read from manifest                 | ISC-9–14  | ds-manifest                | yes            |
| coverage-check     | check-ds-coverage.ts enforces manifest completeness at commit           | ISC-15–19 | ds-manifest                | no             |
| brand-purity       | check-brand-purity.ts blocks @/data imports in biome-exempt files       | ISC-20–22 | —                          | no             |
| design-system-page | /design-system shows all manifest components with live examples         | ISC-23–28 | ds-manifest                | no             |
| audit-scripts      | audit-content.ts + audit-ui.ts with JSON output for LLM agents          | ISC-29–33 | content-layer, ds-manifest | yes            |
| mobilenav-fix      | Fix remaining raw button in MobileNav.tsx                               | ISC-34    | detection-scripts          | no             |
| production-og      | Rachel birthday OG image renders ai-from-2089 design on production      | ISC-35–38 | —                          | no             |

## Decisions

- 2026-06-12: Chose CDN URL over `process.cwd()/public/` for OG image table photo. Vercel File Trace doesn't bundle `public/` into serverless functions; CDN URL is the proper architecture. `sharp` removed from OG image runtime path entirely.
- 2026-06-12: `force-dynamic` added to `opengraph-image.tsx` to prevent build-time static caching. Slug configs change with code deploys; on-demand rendering is correct.
- 2026-06-12: Manifest-driven enforcement chosen over hardcoded rule arrays. Root cause of GradientText miss: three surfaces (component file, detection rule, DS page) had no enforced relationship. Manifest creates the single source of truth; `check-ds-coverage.ts` enforces completeness.
- 2026-06-12: Haiku-tier agents validated for simple label extraction (36k tokens, 32s per file vs Forge's 88k/310s). All 638 content violations migrated with Haiku + parallel worktrees. Sonnet not needed for any batch.
- 2026-06-12: `outputFileTracingIncludes` workaround reverted. It was a config patch over the wrong architecture; CDN URL is the Vercel-native approach.
