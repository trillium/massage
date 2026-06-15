#!/usr/bin/env bash
set -euo pipefail

if [ "${CI:-}" = "true" ] || [ "${GITHUB_ACTIONS:-}" = "true" ]; then
  exit 0
fi

BASELINE_FLAGS=""
if [ -f .fallow/dead-code-baseline.json ]; then
  BASELINE_FLAGS="$BASELINE_FLAGS --dead-code-baseline .fallow/dead-code-baseline.json"
fi
if [ -f .fallow/dupes-baseline.json ]; then
  BASELINE_FLAGS="$BASELINE_FLAGS --dupes-baseline .fallow/dupes-baseline.json"
fi
if [ -f .fallow/health-baseline.json ]; then
  BASELINE_FLAGS="$BASELINE_FLAGS --health-baseline .fallow/health-baseline.json"
fi

if ! command -v fallow &>/dev/null; then
  if command -v npx &>/dev/null; then
    npx --no-install fallow audit --changed-since main $BASELINE_FLAGS 2>/dev/null || {
      echo "fallow: not available, skipping health check"
      exit 0
    }
  else
    echo "fallow: not available, skipping health check"
    exit 0
  fi
else
  fallow audit --changed-since main $BASELINE_FLAGS
fi
