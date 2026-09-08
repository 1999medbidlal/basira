#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$SCRIPT_DIR/dist"

echo "=== 1. Compiling Vite Bundle ==="
cd "$PROJECT_ROOT"
npm run build

echo "=== 2. Assembling Cloudflare Distribution ==="
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"
cp -r "$PROJECT_ROOT/dist/"* "$DIST_DIR/"
cp "$SCRIPT_DIR/_headers" "$DIST_DIR/"

echo "=== SUCCESS: Distribution ready in $DIST_DIR ==="
