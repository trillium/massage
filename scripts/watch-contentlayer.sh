#!/bin/bash
# Watch contentlayer MDX files and rebuild on changes

echo "👀 Watching data/clientSlugs for changes..."

# Use chokidar-cli if available, fall back to simple polling
if command -v chokidar &> /dev/null; then
  chokidar "data/clientSlugs/**/*.mdx" -c "echo '🔄 Rebuilding contentlayer...' && pnpm build"
else
  # Fallback: simple polling every 2 seconds
  while true; do
    find data/clientSlugs -name "*.mdx" -newer /tmp/contentlayer-watch-marker 2>/dev/null | grep -q . && {
      echo "🔄 Rebuilding contentlayer..."
      pnpm build
      touch /tmp/contentlayer-watch-marker
    }
    sleep 2
  done
fi
