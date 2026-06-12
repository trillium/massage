#!/usr/bin/env python3
"""
Extract bare JSX text nodes from a file of TSX/TS source.

Usage:
  python3 _lint-content-extract.py <path>
      Scan the file at <path> and emit findings as `LINE:TEXT` on stdout.
  python3 _lint-content-extract.py --line
      Read one line on stdin and emit same-line findings as `1:TEXT`.

Approach (conservative, low false-positive):
  TSX is ambiguous to parse without a real parser (`<Foo>` is both a generic
  and an element). Instead this scanner finds two kinds of suspect text:

  1. SANDWICH: a line whose stripped content is plain English (no code
     symbols) and that lives between a line ending with `>` and the next
     non-blank line that starts with `<` or `{` or another text line in the
     same sandwich. This catches the dominant pattern in this codebase:

         <label htmlFor="phone">
           Phone Number
         </label>

  2. INLINE: a line containing the exact substring `>TEXT<` where TEXT is
     plain English (no code symbols), TEXT is at least 3 chars, and `<` is
     not the start of an arrow `<=` or `</`. Catches `<span>Beta</span>`.

  Both modes skip:
    - text containing TS/JS operators (`=`, `:`, `(`, `)`, `?`, `;`, `&&`,
      `||`, `=>`, `{`, `}`)
    - text that is only whitespace, punctuation, single/two chars, numeric,
      HTML entity
    - lines with `// content-ok`
    - lines with `data-content-skip=`
    - files with `/* content-ok-file */`
"""

from __future__ import annotations

import re
import sys

OPT_OUT_INLINE = "// content-ok"
OPT_OUT_BLOCK_ATTR = "data-content-skip="
OPT_OUT_FILE_DOC = "/* content-ok-file */"

SKIP_ONLY_RE = re.compile(r"^[\s\W\d_]*$")
ENTITY_RE = re.compile(r"^&[a-zA-Z#0-9]+;$")
CODE_SYMBOL_RE = re.compile(r"[=;(){}:<>]|&&|\|\||=>")
LINE_ENDS_WITH_GT_RE = re.compile(r">\s*$")
LINE_STARTS_TAG_RE = re.compile(r"^\s*<")
LINE_STARTS_EXPRESSION_RE = re.compile(r"^\s*\{")
INLINE_TEXT_RE = re.compile(r">([^<>{}\n]{3,}?)<")
WORD_RE = re.compile(r"[A-Za-z]")


def is_pure_text(text: str) -> bool:
    """A token of plain user-facing text — letters, spaces, normal punctuation."""
    stripped = text.strip()
    if not stripped:
        return False
    if len(stripped) <= 2:
        return False
    if SKIP_ONLY_RE.match(stripped):
        return False
    if ENTITY_RE.match(stripped):
        return False
    if CODE_SYMBOL_RE.search(stripped):
        return False
    if not WORD_RE.search(stripped):
        return False
    return True


def strip_block_comments(source: str) -> str:
    """Replace block comment contents with spaces; preserve newlines."""
    result: list[str] = []
    i = 0
    n = len(source)
    while i < n:
        if source.startswith("/*", i):
            while i < n and not source.startswith("*/", i):
                result.append("\n" if source[i] == "\n" else " ")
                i += 1
            if i < n:
                result.append("  ")
                i += 2
            continue
        result.append(source[i])
        i += 1
    return "".join(result)


def scan_text(source: str) -> list[tuple[int, str]]:
    if OPT_OUT_FILE_DOC in source:
        return []

    raw_lines = source.split("\n")
    no_block = strip_block_comments(source).split("\n")

    findings: list[tuple[int, str]] = []
    seen: set[tuple[int, str]] = set()

    def line_opt_out(line_no: int) -> bool:
        raw = raw_lines[line_no - 1] if line_no - 1 < len(raw_lines) else ""
        return OPT_OUT_INLINE in raw or OPT_OUT_BLOCK_ATTR in raw

    def emit(line_no: int, text: str) -> None:
        key = (line_no, text)
        if key in seen:
            return
        if line_opt_out(line_no):
            return
        seen.add(key)
        findings.append((line_no, text))

    open_sandwich = False
    for idx, raw in enumerate(no_block):
        line_no = idx + 1
        stripped = raw.strip()
        if not stripped:
            continue

        if not open_sandwich:
            if LINE_ENDS_WITH_GT_RE.search(stripped) and not stripped.endswith("/>"):
                if "</" in stripped:
                    pass
                else:
                    open_sandwich = True
            inline_part = stripped
        else:
            if LINE_STARTS_TAG_RE.match(stripped) or LINE_STARTS_EXPRESSION_RE.match(stripped):
                inline_part = stripped
                if LINE_ENDS_WITH_GT_RE.search(stripped) and not stripped.endswith("/>"):
                    if "</" in stripped and not stripped.startswith("<"):
                        open_sandwich = False
                    elif stripped.startswith("</"):
                        open_sandwich = False
                    else:
                        open_sandwich = True
                else:
                    open_sandwich = False
            else:
                if is_pure_text(stripped):
                    emit(line_no, stripped)
                    continue
                open_sandwich = False
                inline_part = stripped

        for m in INLINE_TEXT_RE.finditer(inline_part):
            text = m.group(1).strip()
            if is_pure_text(text):
                emit(line_no, text)

    return findings


def scan_file(path: str) -> list[tuple[int, str]]:
    try:
        with open(path, "r", encoding="utf-8") as fh:
            source = fh.read()
    except OSError:
        return []
    return scan_text(source)


def scan_line(line: str) -> list[tuple[int, str]]:
    if OPT_OUT_INLINE in line or OPT_OUT_BLOCK_ATTR in line:
        return []
    findings: list[tuple[int, str]] = []
    for m in INLINE_TEXT_RE.finditer(line):
        text = m.group(1).strip()
        if is_pure_text(text):
            findings.append((1, text))
    return findings


def main(argv: list[str]) -> int:
    if len(argv) >= 2 and argv[1] == "--line":
        line = sys.stdin.read()
        for line_no, text in scan_line(line):
            sys.stdout.write(f"{line_no}:{text}\n")
        return 0

    if len(argv) >= 2:
        path = argv[1]
        for line_no, text in scan_file(path):
            sys.stdout.write(f"{line_no}:{text}\n")
        return 0

    line = sys.stdin.read()
    for line_no, text in scan_line(line):
        sys.stdout.write(f"{line_no}:{text}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
