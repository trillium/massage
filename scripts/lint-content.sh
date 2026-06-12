#!/usr/bin/env bash
# lint-content.sh — block bare JSX text nodes that should live in the content layer.
#
# Scans staged .tsx/.ts files (or files passed as args, via lint-staged) for
# JSX text nodes that are not in the content layer. Content layer root for
# this project is `data/`.
#
# Skips:
#   - data/ itself (content layer)
#   - __tests__/, .test., .spec.
#   - single/two-char strings, numeric, punctuation-only (handled by helper)
#
# Opt-outs (handled by the Python helper):
#   - // content-ok      (single line)
#   - data-content-skip="reason"   (block — line containing the attribute is skipped)
#   - /* content-ok-file */        (file-wide, anywhere in source)
#
# Exit codes:
#   0  clean
#   1  one or more violations

set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
HELPER="$HERE/_lint-content-extract.py"

if [ ! -f "$HELPER" ]; then
  echo "lint-content: missing helper at $HELPER" >&2
  exit 2
fi

PY="${PYTHON:-python3}"
if ! command -v "$PY" >/dev/null 2>&1; then
  echo "lint-content: python3 not found on PATH" >&2
  exit 2
fi

FILES=()
if [ "$#" -gt 0 ]; then
  FILES=("$@")
else
  while IFS= read -r f; do
    [ -n "$f" ] && FILES+=("$f")
  done < <(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E '\.(tsx|ts)$' || true)
fi

if [ "${#FILES[@]}" -eq 0 ]; then
  exit 0
fi

is_skip_path() {
  case "$1" in
    data/*) return 0 ;;
    */__tests__/*) return 0 ;;
    *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx) return 0 ;;
  esac
  case "$1" in
    *.tsx|*.ts) return 1 ;;
    *) return 0 ;;
  esac
}

violations=0
header_printed=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    continue
  fi
  if is_skip_path "$file"; then
    continue
  fi

  output=$("$PY" "$HELPER" "$file") || {
    rc=$?
    echo "lint-content: helper failed on $file (exit $rc)" >&2
    exit 2
  }

  if [ -z "$output" ]; then
    continue
  fi

  while IFS= read -r entry; do
    [ -z "$entry" ] && continue
    line_no="${entry%%:*}"
    text="${entry#*:}"
    if [ "$header_printed" -eq 0 ]; then
      echo "lint-content: bare JSX text — move to data/ or add // content-ok / data-content-skip=\"reason\"" >&2
      echo "" >&2
      header_printed=1
    fi
    echo "  $file:$line_no  -> $text" >&2
    violations=$((violations + 1))
  done <<EOF
$output
EOF
done

if [ "$violations" -gt 0 ]; then
  echo "" >&2
  echo "lint-content: $violations violation(s). Move strings to data/*.json and import via @/data or @/app/content." >&2
  exit 1
fi

exit 0
