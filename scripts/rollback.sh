#!/usr/bin/env bash
# Install on the PROD EC2 as /opt/cicd-learning/rollback.sh
# Usage:
#   bash /opt/cicd-learning/rollback.sh              # previous release
#   bash /opt/cicd-learning/rollback.sh <artifact>   # specific release dir name

set -euo pipefail

APP_ROOT="/opt/cicd-learning"
RELEASES_DIR="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"
ECOSYSTEM="$APP_ROOT/ecosystem.config.js"
TARGET="${1:-}"

if [ ! -d "$RELEASES_DIR" ]; then
  echo "ERROR: Releases directory missing: $RELEASES_DIR"
  exit 1
fi

mapfile -t RELEASES < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort)

if [ "${#RELEASES[@]}" -eq 0 ]; then
  echo "ERROR: No releases found under $RELEASES_DIR"
  exit 1
fi

echo "Available releases:"
printf '  - %s\n' "${RELEASES[@]}"

CURRENT_TARGET=""
if [ -L "$CURRENT_LINK" ]; then
  # current → .../releases/<artifact>/dist
  RESOLVED="$(readlink -f "$CURRENT_LINK")"
  CURRENT_TARGET="$(basename "$(dirname "$RESOLVED")")"
  echo "Current release: $CURRENT_TARGET"
fi

if [ -z "$TARGET" ]; then
  if [ -z "$CURRENT_TARGET" ]; then
    echo "ERROR: No current release and no target specified."
    exit 1
  fi

  PREV=""
  for name in "${RELEASES[@]}"; do
    if [ "$name" = "$CURRENT_TARGET" ]; then
      break
    fi
    PREV="$name"
  done

  if [ -z "$PREV" ]; then
    echo "ERROR: No previous release before '$CURRENT_TARGET'."
    exit 1
  fi
  TARGET="$PREV"
  echo "Rolling back to previous release: $TARGET"
else
  echo "Rolling back to specified release: $TARGET"
fi

APP_DIR="$RELEASES_DIR/$TARGET/dist"

if [ ! -f "$APP_DIR/src/server.js" ]; then
  echo "ERROR: Invalid release — missing $APP_DIR/src/server.js"
  ls -la "$RELEASES_DIR/$TARGET" || true
  exit 1
fi

echo "Switching current → $APP_DIR"
ln -sfn "$APP_DIR" "$CURRENT_LINK"

echo "Reloading PM2..."
if pm2 describe cicd-learning > /dev/null 2>&1; then
  pm2 reload "$ECOSYSTEM" --update-env
else
  pm2 start "$ECOSYSTEM"
fi
pm2 save

sleep 3

HEALTH_URL="http://127.0.0.1:3010/api/health"
echo "Checking health: $HEALTH_URL"
curl --fail --silent --show-error "$HEALTH_URL"
echo
echo "Rollback complete: $TARGET"
