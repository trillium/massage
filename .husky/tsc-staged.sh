#!/bin/bash
# Type-check staged .ts/.tsx files using tsgo (Go-native TS compiler)
# Runs full project type-check but only fails on errors in staged files

STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
if [ -z "$STAGED" ]; then
  exit 0
fi

ERRORS=$(npx tsgo --noEmit 2>&1 | grep "^[^ ].*error TS" || true)
if [ -z "$ERRORS" ]; then
  exit 0
fi

FAIL=0
for file in $STAGED; do
  MATCHED=$(echo "$ERRORS" | grep "^${file}" || true)
  if [ -n "$MATCHED" ]; then
    if [ "$FAIL" -eq 0 ]; then
      echo "❌ TypeScript errors in staged files:"
      echo ""
    fi
    echo "$MATCHED"
    FAIL=1
  fi
done

exit $FAIL
