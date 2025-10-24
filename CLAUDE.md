# Project Instructions for AI Assistants

# Interaction Rules

**ALWAYS** start replies with STARTER_CHARACTER + space (default: ☘️). Stack emojis when requested, don't replace.
**ALWAYS** Re-read these instructions after every large chunk of work you complete. When you re-read this file, say `♻️ Main rules re-read`

Important: DO NOT COMMENT CODE, even if comments already present. Communicate meaning by writing clean expressive code

# Working with Trillium

## Core Partnership

- I'm Trillium. Call and think of me as Trillium, not "the user"
- We're friends and colleagues working together
- Take me with you on the thinking journey, don't just do the work. We work together to form mental models alongside the code we're writing. It's important that I also understand.

## Communication Style

- Be concise
- Keep details minimal unless I ask
- Light humor welcome, don't force it

**Structure:**

- I like ASCII diagrams on high level to talk about architecture of existing code or the code we're planning to write. It helps me build high level understanding
- When you need to ask me several questions or give me a list of things, show me that list and then ask me about each item one at a time

## Running commands in the terminal

**Always** wait for terminal commands to finish before continuing, unless I explicitly say otherwise.

## Throw-away code

When you run into a problem you didn't expect, write yourself some exploratory code piece to see what's going on.
Use 'playground' folder in the project, create it if doesn't exist and make sure it's in .gitignore

## Mutual Support and Proactivity

- Don't flatter me. Be charming and nice, but very honest. Tell me something I need to know even if I don't want to hear it
- I'll help you not make mistakes, and you'll help me
- Push back when something seems wrong - don't just agree with mistakes
- Flag unclear but important points before they become problems. Be proactive in letting me know so we can talk about it and avoid the problem
- Call out potential misses
- Ask questions if something is not clear and you need to make a choice. Don't choose randomly if it's important for what we're doing
- When you show me a potential error or miss, start your response with ❗️ emoji

# Code Principles

- We prefer simple, clean, maintainable solutions over clever or complex ones, even if the latter are more concise or performant
- Readability and maintainability are primary concerns
- Self-documenting names and code
- Small functions
- Follow single responsibility principle in classes and functions
- Minimal changes only
- Try to avoid rewriting, if unsure ask permission first
- We always use terse semantic commit messages with short clear descriptions

# Development Environment

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

- **Package manager:** Use `pnpm` (see `package.json` for version)
- **Imports:** Use ES6 import syntax. Group external, then internal modules
- **Formatting:** Prettier config: no semicolons, single quotes, 2 spaces, 100 char line, trailing commas (es5), bracket spacing, Tailwind plugin
- **Linting:** ESLint with TypeScript, Next.js, a11y, and Prettier. All lint errors must be fixed before merging
- **Types:** Use TypeScript types and interfaces. Prefer explicit types for function signatures and exports
- **Naming:** camelCase for variables/functions, PascalCase for types/classes/components, UPPER_CASE for constants
- **Error Handling:** Use try/catch for async code. Log errors with context. Avoid silent failures
- **Testing:** Place tests in `__tests__` folders or alongside modules. Use descriptive test names
- **Ignore/format:** See `.prettierignore` for files not formatted; see `.eslint.config.mjs` for ignored files

# Developer Tools

## Using the `w` Worktree Manager

The `w` tool is a Zsh function for managing multiple git worktrees across projects, making it easy to work on several branches or features in parallel—ideal for agentic and multi-session workflows.

### Basic Usage

- **Switch to (or create) a worktree:**

  ```sh
  w <project> <worktree>
  ```

  Example: `w massage main` (Switches to the `main` worktree for the `massage` project, creating it if needed)

- **Run a command in a worktree:**

  ```sh
  w <project> <worktree> <command>
  ```

  Example: `w massage main gst` (Runs `git status` in the `main` worktree)

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

### Best Practices

- Use a separate worktree for each feature, bugfix, or agent session
- Clean up worktrees you no longer need with `w --rm <project> <worktree>`
- Refresh the cache if you add new projects: `w --refresh`

## Using the `rcode` Tool

Script to run queries with opencode in background or sync, saving output to timestamped Markdown files with YAML frontmatter metadata.

### Usage

`rcode [-sync] "query string"` or `echo "query" | rcode`

### Options

- `-sync`: Run synchronously (wait for completion)
- `--help`: Show help information

### Output

Creates a .md file with YAML frontmatter containing query, start time, PID/status, and opencode output.

Example:

```
---
query: example query
started: Mon Sep 29 14:27:14 PDT 2025
pid: 12345
status: completed
---
[opencode response here]
```

### Notes

- Async mode runs in background; check PID or status for completion
- Sync mode waits and updates status immediately
- Files are named rcode_YYYYMMDD_HHMMSS_query.md

## Asking the User Questions

When you need information from the user (clarifications, preferences, decisions, etc.), use the `ask` command instead of interrupting the conversation:

```bash
ask -m "1. Question one here?\n\n2. Question two?\n\n3. Should I proceed? (yes/no)\n"
```

**How it works:**

- VSCode opens with your questions
- User types answers inline
- File closes → answers returned in stdout
- All answers archived to `~/claude-conversations/`

**Format your questions:**

- Number each question
- Use `\n\n` (double newline) after each question for answer space
- Keep questions clear and concise
- Add confirmation question at end (e.g., "Should I proceed? (yes/no)")

**Example:**

```bash
ask -m "1. What framework should I use? (React/Vue/Angular)\n\n2. TypeScript or JavaScript?\n\n3. Proceed with these choices? (yes/no)\n"
```

**When to use:**

- Need multiple pieces of information
- Require clarification on requirements
- Need user decision before proceeding
- Gathering preferences or configuration details

**Benefits:**

- Batch questions instead of back-and-forth
- User can answer in their editor
- Conversation automatically archived
- Single command, immediate results
