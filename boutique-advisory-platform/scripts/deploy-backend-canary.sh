#!/usr/bin/env bash
set -euo pipefail

# Phase-1 canary helper for BIA monorepo.
# Usage:
#   ./scripts/deploy-backend-canary.sh [repo_root]
# Example:
#   ./scripts/deploy-backend-canary.sh ~/BIA

REPO_ROOT="${1:-$HOME/BIA}"
SERVICE_DIR="$REPO_ROOT/boutique-advisory-platform/backend"

if ! command -v git >/dev/null 2>&1; then
  echo "❌ git is required" >&2
  exit 1
fi

if ! command -v railway >/dev/null 2>&1; then
  echo "❌ railway CLI is required (https://docs.railway.com/develop/cli)" >&2
  exit 1
fi

if [[ ! -d "$SERVICE_DIR" ]]; then
  echo "❌ backend service directory not found: $SERVICE_DIR" >&2
  exit 1
fi

cd "$REPO_ROOT"

echo "==> Verifying clean repository state"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ Working tree is dirty. Commit/stash before deploy." >&2
  git status --short
  exit 1
fi

echo "==> Syncing branches"
git fetch origin
git checkout work
git pull --ff-only origin work
git push origin work

git checkout main
git pull --ff-only origin main
git merge --ff-only work
git push origin main

echo "==> Deploying backend (canary-ready baseline)"
cd "$SERVICE_DIR"

# Reduce upload size before Railway upload (monorepo + Cloudflare payload limits)
find . -type d -name node_modules -prune -exec rm -rf {} + || true
rm -rf .next dist build || true

railway up

echo "✅ Deploy completed"
