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

## Using the `w` Worktree Manager

The `w` tool is a Zsh function for managing multiple git worktrees across projects, making it easy to work on several branches or features in parallel—ideal for agentic and multi-session workflows.

### Basic Usage

- **Switch to (or create) a worktree:**

  ```sh
  w <project> <worktree>
  ```

  - Example: `w massage main`  
    (Switches to the `main` worktree for the `massage` project, creating it if needed.)

- **Run a command in a worktree:**

  ```sh
  w <project> <worktree> <command>
  ```

  - Example: `w massage main gst`  
    (Runs `git status` in the `main` worktree.)

- **List all worktrees:**

  ```sh
  w --list
  ```

- **Remove a worktree:**

  ```sh
  w --rm <project> <worktree>
  ```

- **Refresh the project cache:**
  ```sh
  w --refresh
  ```

### Typical Workflow

1. **Start a new feature or agent session:**

   ```sh
   w massage my-feature
   ```

   (Creates and enters a new worktree/branch for `my-feature`.)

2. **Switch between parallel worktrees:**

   ```sh
   w massage main
   w massage landing
   ```

3. **Run git or npm commands in a worktree:**

   ```sh
   w massage main gst
   w massage landing npm test
   ```

4. **List all active worktrees:**
   ```sh
   w --list
   ```

### Best Practices

- Use a separate worktree for each feature, bugfix, or agent session.
- Clean up worktrees you no longer need with `w --rm <project> <worktree>`.
- Refresh the cache if you add new projects: `w --refresh`.

---

**Example: Updating AGENTS.md in the main worktree**

```sh
w massage main
# Now you are in the main worktree directory
nano AGENTS.md   # or use your preferred editor
git add AGENTS.md
git commit -m "docs: update AGENTS.md with w tool usage"
git push
```

---

## Terminal Command Guidelines

- **Destructive commands:** When proposing commands that delete files or directories (like `rm -rf`), always include a comment line above explaining the purpose:
  ```sh
  # Clear corrupted Next.js build cache
  rm -rf .next
  ```
  This helps prevent accidental execution and makes the intent clear.
