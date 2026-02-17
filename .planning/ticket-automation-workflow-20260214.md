# Ticket Automation Workflow

**Created:** 2026-02-14
**Status:** Design Phase

## Overview

Automated ticket processing system that:
- Processes tickets from `.planning/todo.md` sequentially
- Uses fresh context per ticket (no memory carryover)
- Creates PRs with dual-agent review
- Names branches after the task being completed

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TICKET ORCHESTRATOR                      │
│  (Reads .planning/todo.md, manages sequential processing)  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├──> For each ticket:
                       │
       ┌───────────────┴────────────────┐
       │   1. Create Fresh Worktree     │
       │      w massage task-<slug>     │
       └───────────────┬────────────────┘
                       │
       ┌───────────────┴────────────────┐
       │   2. Launch Sub-Agent          │
       │      (Fresh context, no memory)│
       │      - Implements ticket       │
       │      - Runs tests              │
       │      - Creates PR              │
       └───────────────┬────────────────┘
                       │
       ┌───────────────┴────────────────┐
       │   3. Dual Review Process       │
       │      ├─> Review Agent 1 (Linus)│
       │      └─> Review Agent 2 (Clean)│
       └───────────────┬────────────────┘
                       │
       ┌───────────────┴────────────────┐
       │   4. Mark Complete & Continue  │
       │      - Update todo.md          │
       │      - Move to next ticket     │
       └────────────────────────────────┘
```

## Components to Build

### 1. Ticket Orchestrator (`scripts/ticket-orchestrator.ts`)
- Reads and parses `.planning/todo.md`
- Manages sequential ticket processing
- Creates worktrees with appropriate branch names
- Coordinates sub-agents and reviewers
- Updates ticket status

### 2. Ticket Parser (`scripts/ticket-parser.ts`)
- Extracts actionable tasks from todo.md
- Prioritizes tasks (Quick Wins → Small/Medium → Large)
- Generates branch names from task descriptions
- Tracks completion status

### 3. Task Agent Spawner (`scripts/task-agent.ts`)
- Spawns Claude Code agent with fresh context
- Passes task description
- Monitors progress
- Ensures tests pass
- Creates pull request

### 4. Review Agents (Skills)

#### Linus Reviewer (`.claude/skills/linus-reviewer.md`)
- Direct, no-nonsense code review
- Focuses on performance, correctness, edge cases
- Questions design decisions
- Ruthlessly identifies potential bugs

#### Clean Code Reviewer (`.claude/skills/clean-code-reviewer.md`)
- Robert C. Martin principles
- Readability and maintainability focus
- SOLID principles adherence
- Naming, structure, simplicity

## Workflow Steps

1. **Ticket Selection**
   - Parse `.planning/todo.md`
   - Select next uncompleted task
   - Generate descriptive branch name (e.g., `feat/normalize-avatar-photos`)

2. **Worktree Creation**
   ```bash
   w massage <branch-name>
   ```

3. **Agent Execution**
   - Launch sub-agent with task description
   - Agent works in isolation (fresh context)
   - Agent runs tests, lint, format
   - Agent creates commit(s)
   - Agent pushes branch

4. **PR Creation**
   ```bash
   gh pr create --title "..." --body "..."
   ```

5. **Dual Review**
   - Launch `/linus-review` on PR
   - Launch `/clean-code-review` on PR
   - Collect feedback from both

6. **Completion**
   - Mark ticket as complete in todo.md
   - Move to next ticket
   - Repeat

## Branch Naming Convention

Generated from task description:
- "Normalize avatar photo across all About pages" → `feat/normalize-avatar-photos`
- "Update FAQ section to use images" → `feat/faq-image-support`
- "Enable image rendering on slug-based booking pages" → `feat/slug-page-images`

## Fresh Context Strategy

Each sub-agent starts with:
- Current codebase state (from main)
- Task description only
- No memory of previous tickets
- No context from other agents

This ensures:
- Clean architectural decisions per feature
- No contamination from previous work
- Each feature stands on its own
- Easier to review and test

## Review Criteria

### Linus Reviewer Checks
- Code correctness
- Performance implications
- Edge cases handled
- Potential bugs or race conditions
- Unnecessary complexity

### Clean Code Reviewer Checks
- Function/variable naming
- Single responsibility principle
- DRY violations
- Code duplication
- Test coverage
- Readability

## Success Metrics

- [ ] All quick wins (11 tasks) completed
- [ ] All small/medium tasks completed
- [ ] PRs have dual review
- [ ] All tests pass
- [ ] No manual intervention needed
- [ ] Branch names are descriptive
- [ ] Fresh context maintained per task

## Next Steps

1. Implement ticket parser
2. Implement orchestrator
3. Create review skills
4. Test with first quick win
5. Iterate and improve

## Notes

- Use existing slash commands `/linus-review` and `/clean-code-review`
- Leverage `w` worktree manager for parallel development
- Follow existing commit message conventions
- Maintain AGENTS.md guidelines throughout
