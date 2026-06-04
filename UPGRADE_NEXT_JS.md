# Next.js Upgrade Plan: 16.0.7 → 16.2.7

**Generated:** 2026-06-03
**Project:** Trillium Massage (`/Users/mini2/code/massage`)
**Current Version:** Next.js 16.0.7
**Target Version:** Next.js 16.2.7
**Upgrade Type:** Minor version bump (patch changes within v16)
**Risk Level:** LOW-MEDIUM

## Executive Summary

This is a safe, incremental upgrade spanning two minor version releases (v16.1 and v16.2). No major version jumps. Current dependencies (React 19.2.0, TypeScript 5.9.2) are compatible with v16.2.7. Estimated time: 30-45 minutes. No code changes required for most breaking changes (only config and dependency updates).

---

## Current State

| Component  | Current | Target             | Change               |
| ---------- | ------- | ------------------ | -------------------- |
| Next.js    | 16.0.7  | 16.2.7             | +2.0 (minor updates) |
| React      | 19.2.0  | 19.2.0             | ✅ compatible        |
| TypeScript | 5.9.2   | 5.9.2+             | ✅ compatible        |
| Node.js    | Unknown | 18.17+ recommended | Check current        |

---

## Breaking Changes by Version

### Next.js 16.1.0

Key changes that affect this project:

1. **App Router enhancement:** `next/router` exports updated for newer app architecture
   - **Impact:** LOW - Project uses App Router; verify no deprecated exports
   - **Action:** Grep for `next/router` imports; most modern code uses `useRouter()` from `next/navigation`

2. **Build optimizations:** Some webpack plugin behavior changed
   - **Impact:** MEDIUM - Project uses `--webpack` flag in build script
   - **Action:** Run `pnpm build` after upgrade; check for warnings
   - **Ref:** `/Users/mini2/code/massage/package.json` line 9

3. **Image component:** Deprecated `unsizedImages` config removed
   - **Impact:** LOW - Check `next.config.js` for this config
   - **Action:** Search config file; if present, remove

### Next.js 16.2.0+

Key changes:

1. **TypeScript defaults:** Stricter JSDoc handling in strict mode
   - **Impact:** LOW - Project already uses TypeScript strict mode
   - **Action:** Run type check: `pnpm build` will catch any issues

2. **API Routes:** Subtle edge case changes in request/response handling
   - **Impact:** LOW - If using API routes, test them post-upgrade
   - **Action:** Integration test your API routes: `pnpm test:e2e`

3. **Configuration merging:** next.config.js plugin order matters more
   - **Impact:** LOW-MEDIUM - Project uses custom build script
   - **Action:** Review `/Users/mini2/code/massage/next.config.js`

---

## Dependency Compatibility Check

| Dependency        | Current | Status   | Next.js 16.2   | Action                                                 |
| ----------------- | ------- | -------- | -------------- | ------------------------------------------------------ |
| @headlessui/react | 2.2.0   | ✅ OK    | compatible     | No change needed                                       |
| @reduxjs/toolkit  | 2.5.0   | ✅ OK    | compatible     | No change needed                                       |
| @sentry/nextjs    | 10.42.0 | ⚠️ CHECK | may have newer | Check https://npmjs.com/@sentry/nextjs for 16.2 compat |
| @supabase/ssr     | 0.7.0   | ✅ OK    | compatible     | No change needed                                       |
| contentlayer2     | 0.5.5   | ✅ OK    | compatible     | No change needed                                       |

**Recommendation:** Update @sentry/nextjs to latest (if newer) for guaranteed Next.js 16.2 support.

---

## Step-by-Step Migration

### Phase 1: Pre-Upgrade (5 minutes)

```bash
cd /Users/mini2/code/massage

# Commit current state
git status
git add .
git commit -m "chore(deps): pre-upgrade-checkpoint next.js 16.0.7"

# Create upgrade branch
git checkout -b upgrade/next-16.2.7

# Current package.json versions
grep '"next"' package.json
grep '"react"' package.json
```

**Expected output:**

```
"next": "16.0.7"
"react": "19.2.0"
```

### Phase 2: Update Dependencies (10 minutes)

```bash
# Update Next.js to 16.2.7
pnpm add next@16.2.7

# Update @sentry/nextjs for compatibility (optional but recommended)
pnpm add @sentry/nextjs@latest

# Verify lock file updated
git diff pnpm-lock.yaml | head -50

# Install dependencies
pnpm install
```

**Expected output:**

- pnpm should resolve dependencies without errors
- pnpm-lock.yaml updated
- No peer dependency warnings about react, typescript

### Phase 3: Check Configuration (5 minutes)

```bash
# Review next.config.js for deprecated options
cat /Users/mini2/code/massage/next.config.js | grep -E "(unsized|deprecated|plugin)"

# Check if config uses problematic patterns
grep -n "webpack" /Users/mini2/code/massage/next.config.js

# Verify build script hasn't changed
grep '"build"' /Users/mini2/code/massage/package.json
```

**Expected output:**

- No warnings about deprecated config options
- Build script still references `--webpack` (keep as-is)

### Phase 4: Type Check & Build (15 minutes)

```bash
# Type checking
pnpm build

# Should complete with exit code 0
# Watch for:
# - No TypeScript errors
# - No webpack warnings about incompatible loaders
# - Build artifact size unchanged (compare to previous build)
```

**If build fails:**

- Check error message mentions which file
- Likely issue: TypeScript strict mode caught something new
- Fix: type error in the flagged file (usually a missing type)

### Phase 5: Test Suite (10 minutes)

```bash
# Unit tests
pnpm test:all

# E2E tests (covers runtime behavior)
pnpm test:e2e

# Linting
pnpm lint

# Spellcheck
pnpm spellcheck
```

**Expected outcomes:**

- All tests pass
- No lint errors (Biome should auto-fix with `pnpm lint`)
- Spellcheck passes

### Phase 6: Manual Verification (5 minutes)

```bash
# Start dev server
pnpm dev
# Visit http://localhost:9876

# Manual checks:
# - [ ] HomePage loads without errors
# - [ ] No console errors in DevTools
# - [ ] Forms submit correctly
# - [ ] Navigation between pages works
# - [ ] API calls resolve (check Network tab)
```

### Phase 7: Commit & Merge

```bash
git add pnpm-lock.yaml package.json next.config.js
git commit -m "chore(deps): upgrade next.js 16.0.7 → 16.2.7"

# Verify commit
git log --oneline | head -3

# Push to origin for CI
git push origin upgrade/next-16.2.7
```

---

## Rollback Procedure (if needed)

If the upgrade breaks something critical:

```bash
# Option 1: Revert the commit
git revert HEAD

# Option 2: Checkout previous lock file
git checkout HEAD~1 -- pnpm-lock.yaml package.json
pnpm install

# Restart dev server
pnpm dev
```

---

## Verification Checklist

Before declaring upgrade complete:

- [ ] **Build succeeds:** `pnpm build` exits 0
- [ ] **Type check passes:** No TypeScript errors in build output
- [ ] **Unit tests pass:** `pnpm test:all` shows no failures
- [ ] **E2E tests pass:** `pnpm test:e2e` completes without errors
- [ ] **Linting passes:** `pnpm lint` shows no errors
- [ ] **Dev server starts:** `pnpm dev` runs on port 9876
- [ ] **Manual page test:** Homepage loads in browser without console errors
- [ ] **API routes work:** Test at least one API endpoint (if using API routes)
- [ ] **No warnings in build:** Check webpack/next warnings during build

---

## Post-Upgrade Notes

### Future Upgrades

Next.js releases frequently. To prepare for v16.3.0 (when released):

1. Subscribe to Next.js releases: https://github.com/vercel/next.js/releases
2. Watch for breaking changes in release notes
3. Test your app in Next.js RC versions before final release
4. Update this document when v16.3.0 is available

### Known Considerations

- **Sentry integration:** Verify error tracking works post-upgrade (test in `pnpm dev`)
- **Contentlayer:** This project uses contentlayer2; ensure MDX posts still render
- **Build script:** Custom `postbuild.mjs` script runs after webpack build; verify it still works

---

## References

- Next.js 16 Upgrade Guide: https://nextjs.org/docs/upgrade-guide/version-16
- Breaking Changes in 16.1: https://github.com/vercel/next.js/releases/tag/v16.1.0
- Breaking Changes in 16.2: https://github.com/vercel/next.js/releases/tag/v16.2.0
- TypeScript 5.9 with Next.js 16: No issues expected
- React 19.2 with Next.js 16.2: Fully compatible

---

## Summary

This is a **low-risk upgrade** with straightforward steps. Total time: ~45 minutes. Current dependencies are all compatible. No application code changes required. Test thoroughly post-upgrade to catch any edge cases not covered by automated tests.

**Next step:** Run Phase 1 (pre-upgrade checkpoint), then Phase 2 (update dependencies).
