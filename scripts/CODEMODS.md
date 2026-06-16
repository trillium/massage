# Codemod Scripts

These scripts migrate raw HTML elements to design system (DS) components. They exist because the DS was introduced to a codebase that already had hundreds of raw `<div>`, `<p>`, `<h1>`, etc. elements — the codemods let us mechanically backfill rather than hand-edit every file.

## The Pipeline

```
audit-ui.ts       →  detect violations (outputs JSON report)
    ↓
migrate-*.ts      →  apply fixes (reads JSON or scans directly)
    ↓
check-design-system.ts  →  verify clean (runs in lint-staged)
```

## Scripts

| Script                     | Approach                | What it migrates                                              | Input                               |
| -------------------------- | ----------------------- | ------------------------------------------------------------- | ----------------------------------- |
| `migrate-ds-elements.ts`   | ts-morph AST            | `<p>`, `<h1–h4>`, `<code>` → DS equivalents                   | Filesystem scan (app/, components/) |
| `migrate-ds-stack-ast.ts`  | TypeScript compiler API | `<div className="flex ...">` → `<Stack>` with prop extraction | Explicit file list CLI args         |
| `migrate-ds-stack.ts`      | Regex + line-by-line    | Same as ast version, line+excerpt from audit JSON             | stdin (audit JSON pipe)             |
| `migrate-ds-text.ts`       | Regex + tag-stack       | `<p>` → `<Text>` variants (TextBase/Sm/Xs/Lg)                 | stdin (audit JSON pipe)             |
| `migrate-ds-spans.ts`      | Regex + tag-stack       | `<span>` → `<Text as="span">` (same variant detection)        | stdin (audit JSON pipe)             |
| `migrate-ds-box.ts`        | Regex + tag-stack       | Bare `<div>` (no attrs) → `<Box>`, pairs closes via stack     | stdin (audit JSON pipe)             |
| `migrate-text-variants.ts` | Regex + partition       | `<p className="text-sm font-bold">` → `<TextSmBold>`          | Filesystem scan (app/, components/) |

### Notes by script

**`migrate-ds-elements.ts`** — ts-morph AST walker. Renames opening + closing + self-closing JSX elements. Uses `{start, end, newText}` tuple collection + reverse-order string slicing to avoid stale node references. The `SUBSTITUTIONS` array also includes `<div>` → `<Box>`, **but this entry is too aggressive** — it converts ALL divs regardless of styling. Use the dedicated `migrate-ds-box.ts` for the bare-div case instead.

**`migrate-ds-stack-ast.ts`** — uses the raw `typescript` compiler API (NOT ts-morph). Walks `JsxElement` and `JsxSelfClosingElement` nodes, extracts `className` from string literals and `clsx()` calls. Parses flex classes into `Stack` props (`direction`, `align`, `justify`, `gap`, `wrap`). Handles responsive variant checking (`respFlexOnly` blocks, `respFlexDir` passes through). Closing tags paired via a separate `pairClosingTags()` regex pass over the result string.

**`migrate-ds-stack.ts`** — reads raw-stack violations from audit JSON, processes line-by-line regex. Uses the same `classToProp` map as the AST version. Closes paired via a regex-based stack pass over the full file (same `pairClosingTags` algorithm). Falls back for same-line and cross-line close tags.

**`migrate-ds-text.ts`** / **`migrate-ds-spans.ts`** — character-level tag scanning (not regex) to avoid false matches in template literals. Detect variant from className (`text-xs` → `TextXs`, etc.). Maintain a variant stack to emit matching close tags. Import merging: if an existing `@/components/ui/text` import exists, merges new names into it (single-line and multi-line forms).

**`migrate-ds-box.ts`** — two-tag-stack algorithm. Pass 1: regex-scan all `<div>` tags, classify as `bare-open` / `non-bare-open` / `close` / `bare-selfclose` / `non-bare-selfclose`. Pass 2: pair closes with opens via a stack, mark close as replaceable only if its open was `bare-open`. Pass 3: mark bare opens and self-closes for replacement. Pass 4: rebuild right-to-left. Key gotcha: self-closing divs with attributes (`<div className={...} />`) match `[^>]*` regex across newlines — they must be detected via `tag.endsWith('/>') && /^<div[\s>]/.test(tag)` and excluded from the stack (they push nothing).

**`migrate-text-variants.ts`** — text-style class partitioner. Splits className into `textStyle` vs `layout` tokens, then maps text style tokens to named components (e.g. `text-sm` + `font-semibold` + `muted` → `TextSmSemibold status="muted"`). If layout tokens still contain text style after extraction, inserts a `{/* ds-review */}` comment for manual inspection. Imports merged into existing lines when possible.

## Common Patterns

### Approach comparison

| Approach                | Pros                                        | Cons                                                    | When to use                                 |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| ts-morph AST            | AST-accurate, no false matches              | Heavy dep, memory on batch (must `removeSourceFile`)    | Renaming tags, complex structural changes   |
| TypeScript compiler API | Zero dep (already in project), AST-accurate | More verbose, manual node walking                       | Renaming with className extraction (clsx()) |
| Regex + tag-stack       | Fast, zero deps beyond built-in             | Fragile: matches inside comments/strings if not careful | Bare tag swaps, simple attribute patterns   |
| Character scan          | Immune to template-literal false matches    | Slow for large files, verbose                           | `<p>`, `<span>` where `/<` would over-match |

### Import handling — 4 approaches across the codebase

1. **Simple string check** (`migrate-ds-stack.ts`, `migrate-ds-stack-ast.ts`, `migrate-ds-box.ts`): check if import string exists, insert after last `^import` line. No merge — assumes the import doesn't exist yet or the component isn't already imported.

2. **Named import regex + merge** (`migrate-ds-text.ts`, `migrate-ds-spans.ts`): regex-match the import block, parse names, add missing names. Handles single-line and multi-line import blocks. Used when the component might already be partially imported (e.g. file already has `TextBase`, needs `TextSm`).

3. **`findExistingImport()` + merge** (`migrate-text-variants.ts`): line-by-line regex for `import {X} from 'path'`, merges new names into the existing line. Falls back to inserting a new import line after the last import.

4. **`hasImport()` + `injectImports()`** (`migrate-ds-elements.ts`): checks per-component-name, builds deduplicated import lines, inserts after last `@/components/ui/` import (or last import overall). Handles multi-line continuation.

**Consolidation note**: These 4 approaches should be unified. The `migrate-text-variants.ts` approach (approach 3) is the most robust — it handles existing imports with merge, multi-line imports, and smart insertion position. Consider extracting `injectImports()` into `scripts/lib/imports.ts` for reuse.

## Running a Migration

### Scan everything, then apply

```bash
# 1. See what would change (dry run)
bun scripts/migrate-ds-elements.ts --dry-run

# 2. Apply
bun scripts/migrate-ds-elements.ts

# 3. For the audit-JSON-driven scripts, pipe the report
bun scripts/audit-ui.ts | bun scripts/migrate-ds-stack.ts --write
```

### Single file

```bash
bun scripts/migrate-ds-elements.ts --file app/admin/some-page.tsx --dry-run
bun scripts/migrate-ds-elements.ts --file app/admin/some-page.tsx
```

### After migrating

```bash
pnpm lint          # biome will catch anything that needs formatting
pnpm build         # verify no type errors introduced
```

## Writing a New Codemod

### Pick the right approach

| If you need to...                                                       | Use                                                           |
| ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| Rename bare tags (no attribute inspection)                              | `migrate-ds-box.ts`-style regex + tag-stack (fast, zero deps) |
| Rename tags + extract className to derive new props                     | TypeScript compiler API (no extra dep, AST-stable)            |
| Heavy structural AST work (add/remove children, complex prop injection) | ts-morph                                                      |

The regex approach works for bare tags but is fragile — it will match tags inside template literals, comments, and string content. ts-morph or the TypeScript compiler API walks the actual JSX AST, so it only finds real nodes.

### ts-morph pattern

```typescript
import { Project, SyntaxKind } from 'ts-morph'

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { allowJs: false, jsx: 4 }, // jsx: 4 = React JSX
})

function processFile(absPath: string): string | null {
  let sourceFile
  try {
    sourceFile = project.addSourceFileAtPath(absPath)
  } catch {
    process.stderr.write(`  ⚠ skipping ${absPath} (parse error)\n`)
    return null
  }

  interface Replacement {
    start: number
    end: number
    newText: string
  }
  const replacements: Replacement[] = []

  sourceFile.forEachDescendant((node) => {
    if (node.getKind() === SyntaxKind.JsxOpeningElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxOpeningElement)
      if (el.getTagNameNode().getText() !== 'div') return

      // Collect replacement: where to cut, what to put there
      const tagNode = el.getTagNameNode()
      replacements.push({ start: tagNode.getStart(), end: tagNode.getEnd(), newText: 'Box' })
    }

    // Handle closing elements
    if (node.getKind() === SyntaxKind.JsxClosingElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxClosingElement)
      if (el.getTagNameNode().getText() !== 'div') return
      const tagNode = el.getTagNameNode()
      replacements.push({ start: tagNode.getStart(), end: tagNode.getEnd(), newText: 'Box' })
    }
  })

  project.removeSourceFile(sourceFile) // prevent memory growth on batch runs

  if (replacements.length === 0) return null

  // Apply in reverse so earlier positions aren't invalidated by later edits
  const sorted = replacements.sort((a, b) => b.start - a.start || b.end - a.end)
  let text = sourceFile.getFullText()
  for (const r of sorted) {
    text = text.slice(0, r.start) + r.newText + text.slice(r.end)
  }

  return text
}
```

### Injecting a prop at the same time as renaming

For cases like `<h1>` → `<Heading level={1}>` you need two replacements at the same node:

```typescript
const tagNode = el.getTagNameNode()
// 1. rename the tag
replacements.push({ start: tagNode.getStart(), end: tagNode.getEnd(), newText: 'Heading' })
// 2. insert the prop immediately after the tag name
//    (start === end === tagNode.getEnd() means "insert here")
replacements.push({ start: tagNode.getEnd(), end: tagNode.getEnd(), newText: ' level={1}' })
```

Because we sort by start descending, the insert (at `tagNode.getEnd()`) fires before the rename (at `tagNode.getStart()`). Since the insert lands after the tag name text, it doesn't shift the rename's target range. The result is correct.

### Inspecting attributes

```typescript
// Read a className attribute
const classAttr = el.getAttribute('className')
if (classAttr && classAttr.getKind() === SyntaxKind.JsxAttribute) {
  const init = classAttr.asKindOrThrow(SyntaxKind.JsxAttribute).getInitializer()
  if (init?.getKind() === SyntaxKind.StringLiteral) {
    const classes = init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
    // e.g. "flex items-center gap-4"
  }
}
```

### Keeping all other attributes

```typescript
// Get the text of all attributes except className, to carry them over
const otherAttrs = el
  .getAttributes()
  .filter(
    (a) =>
      a.getKind() !== SyntaxKind.JsxAttribute ||
      (a as JsxAttribute).getNameNode().getText() !== 'className'
  )
  .map((a) => a.getText())
  .join(' ')
```

## Common Gotchas

**Stale node references** — after calling `replaceWithText()` on a node, any other node references collected in the same pass are stale. This is why we collect `{start, end, newText}` tuples first, then apply them via string slicing in reverse order instead of mutating AST nodes directly.

**Self-closing elements** — `<div />` is a `JsxSelfClosingElement`, not a `JsxOpeningElement`. Handle both in ts-morph:

```typescript
const kinds = [SyntaxKind.JsxOpeningElement, SyntaxKind.JsxSelfClosingElement]
if (!kinds.includes(node.getKind())) return
```

With regex, a self-closing `<div ... />` spans multiple lines when attributes have template literals — `[^>]*` across newlines works, but detection must check `tag.endsWith('/>')` BEFORE checking `tag.startsWith('<div ')` (the tag may start with `<div\n` due to newlines in attrs). Use `/^<div[\s>]/` to match either space or newline after `div`.

See `migrate-ds-box.ts` for a complete self-closing-safe tag-stack implementation.

**Tag-stack algorithm for closing tags** — when renaming opening tags (e.g. `<div>` → `<Box>`) you must also rename the closing tag. If any non-bare (styled) divs exist in the same file, a simple string replace breaks. The solution is a two-pass stack:

```
Pass 1: Classify all tags (bare-open, non-bare-open, close, bare-selfclose, non-bare-selfclose)
Pass 2: Iterate: push opens on stack; when close encountered, pop — if open was bare → mark close for replacement
Pass 3: Mark bare-opens and bare-selfcloses for replacement
Pass 4: Rebuild string right-to-left
```

Self-closing tags (regardless of bareness) must never push onto the stack — they don't participate in pairing. Forgetting this causes stack corruption when a styled self-closing div appears inside a bare div pair (the close gets paired with the wrong open).

**`<div ` vs `<div\n`** — when classifying div tags by regex, the opening tag may have a newline immediately after `div` (multi-line attributes). Always use `/^<div[\s>]/.test(tag)` instead of `tag.startsWith('<div ')`.

**Closing-tag pairing via regex full-file scan** — used in `migrate-ds-stack.ts` and `migrate-ds-stack-ast.ts` when separate open/close line processing loses context. Scan the entire result string for `<div>`, `<Stack>` opens and `</div>` closes, pair via stack, replace closes where open was a Stack:

```typescript
const tagRegex = /<\/?div\b[^>]*\/?>|<\/?Stack\b[^>]*\/?>/g
const tags: Array<{ type: 'open' | 'close'; index: number; length: number; isStack: boolean }> = []
```

**Memory on batch runs** — call `project.removeSourceFile(sourceFile)` after processing each file. Otherwise ts-morph holds every parsed file in memory for the whole run.

**jsx compiler option** — without `jsx: 4` (ReactJSX) in compilerOptions, ts-morph may not recognize `.tsx` files as JSX. Pass it explicitly when `skipAddingFilesFromTsConfig: true`.

## Known Inconsistencies

**Import unify needed** — 4 different import-handling approaches exist across the 7 scripts. See "Common Patterns → Import handling" above. Extract to `scripts/lib/imports.ts`.

**`migrate-ds-elements.ts` has a `<div>` → `<Box>` entry** — but it converts ALL divs (styled and bare). This was never used because the dedicated `migrate-ds-box.ts` handles bare divs only. The elements script's div entry is dormant — if enabled, it would duplicate the box codemod's work but with no className guard. Consider removing it.

**`migrate-ds-stack.ts` (deprecated)** — the old regex version is less capable than the AST version (`migrate-ds-stack-ast.ts`). The AST version uses the `typescript` compiler API, handles clsx() calls, responsive variant detection, and remaining-class pass-through. The regex version is kept for reference but marked `@deprecated`. Use `migrate-ds-stack-ast.ts` instead.
