#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

bash "$SCRIPT_DIR/build.sh"

echo "=== Deploying to Cloudflare Pages ==="
npx wrangler pages deploy "$DIST_DIR" --project-name="basira-ocr" --commit-dirty=true
