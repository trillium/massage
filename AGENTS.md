# AGENTS.md

## Build, Lint, and Test Commands

- **Install dependencies:** `pnpm install` (preferred; or `npm install`/`yarn install`)
- **Start dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint (auto-fix):** `pnpm lint`
- **Format:** `pnpm format` (Prettier)
- **Test (all):** `pnpm test`
- **Test (watch):** `pnpm test:watch`
- **Test (coverage):** `pnpm test:coverage`
- **Test (single file):** `pnpm test path/to/file.test.ts` (or use `vitest` CLI directly)
- **Spellcheck:** `pnpm spellcheck` (or `pnpm spellcheck:fix`)
- **Pre-commit:** Uses lint-staged for ESLint, Prettier, and spellcheck on staged files

## Code Style Guidelines

- **Imports:** Use ES6 import syntax. Group external, then internal modules.
- **Formatting:** Prettier config: no semicolons, single quotes, 2 spaces, 100 char line, trailing commas (es5), bracket spacing, Tailwind plugin.
- **Linting:** ESLint with TypeScript, Next.js, a11y, and Prettier. All lint errors must be fixed before merging.
- **Types:** Use TypeScript types and interfaces. Prefer explicit types for function signatures and exports.
- **Naming:** camelCase for variables/functions, PascalCase for types/classes/components, UPPER_CASE for constants.
- **Error Handling:** Use try/catch for async code. Log errors with context. Avoid silent failures.
- **Testing:** Place tests in `__tests__` folders or alongside modules. Use descriptive test names.
- **Ignore/format:** See `.prettierignore` for files not formatted; see `.eslint.config.mjs` for ignored files.
- **Package manager:** Use `pnpm` (see `package.json` for version).
