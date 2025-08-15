# Stash unstaged changes, build, then always restore
git stash push --keep-index -u --quiet
{
  pnpm build
} || {
  # Build failed - still restore stash but preserve exit code  
  BUILD_EXIT_CODE=$?
  git stash pop --quiet || true
  exit $BUILD_EXIT_CODE
}
# Build succeeded - restore stash
git stash pop --quiet