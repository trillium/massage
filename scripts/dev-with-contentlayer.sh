#!/bin/bash
# Run Next.js dev + contentlayer watcher in parallel

echo "🚀 Starting dev server + contentlayer watcher..."
echo ""

# Function to cleanup on exit
cleanup() {
  kill $DEV_PID $WATCH_PID 2>/dev/null
  exit 0
}

trap cleanup EXIT INT TERM

# Start dev server
cross-env INIT_CWD=$PWD next dev --port 9876 &
DEV_PID=$!

# Start contentlayer watcher
bash ./scripts/watch-contentlayer.sh &
WATCH_PID=$!

# Wait for both processes
wait
