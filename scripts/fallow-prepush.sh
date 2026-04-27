#!/usr/bin/env bash
set -euo pipefail

if [ "${CI:-}" = "true" ] || [ "${GITHUB_ACTIONS:-}" = "true" ]; then
  exit 0
fi

if ! command -v fallow &>/dev/null; then
  if command -v npx &>/dev/null; then
    npx --no-install fallow audit --changed-since main 2>/dev/null || {
      echo "fallow: not available, skipping health check"
      exit 0
    }
  else
    echo "fallow: not available, skipping health check"
    exit 0
  fi
else
  fallow audit --changed-since main
fi
