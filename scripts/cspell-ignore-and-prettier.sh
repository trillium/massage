#!/bin/sh
# Usage: ./scripts/cspell-ignore-and-prettier.sh word1 [word2 ...]

for word in "$@"; do
  tsx scripts/cspell-ignore.ts "$word"
done
prettier --write cspell.config.json
