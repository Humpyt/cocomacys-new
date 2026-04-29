#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/cocofashionbrands.com/current"
HEALTH_URL="http://127.0.0.1:4000/api/health"
REF="${1:-main}"

echo "[deploy] Starting deployment for ref: $REF"
cd "$APP_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[deploy] ERROR: $APP_ROOT is not a git checkout."
  exit 1
fi

git fetch --all --prune

if git rev-parse --verify --quiet "origin/$REF^{commit}" >/dev/null; then
  echo "[deploy] Using remote branch origin/$REF"
  git checkout -B "$REF" "origin/$REF"
elif git rev-parse --verify --quiet "$REF^{commit}" >/dev/null; then
  echo "[deploy] Using local/tag/commit $REF"
  git checkout "$REF"
else
  echo "[deploy] ERROR: ref '$REF' not found locally or on origin."
  exit 1
fi

git reset --hard

# Install frontend dependencies and build
npm ci
npm run build

# Copy production environment file if it exists
if [ -f "$APP_ROOT/.env.production" ]; then
  echo "[deploy] Using .env.production"
  cp "$APP_ROOT/.env.production" "$APP_ROOT/server/.env"
fi

# Start/restart API via PM2
pm2 startOrReload deploy/hostinger/pm2/ecosystem.config.cjs --update-env
pm2 save

# Wait for health check
for _ in {1..30}; do
  if curl -fsS "$HEALTH_URL" >/dev/null; then
    echo "[deploy] Health check passed: $HEALTH_URL"
    pm2 status
    exit 0
  fi
  sleep 1
done

echo "[deploy] ERROR: health check failed after restart."
exit 1
