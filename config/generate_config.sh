#!/usr/bin/env bash
# Requires Pkl CLI: https://pkl-lang.org/main/current/pkl-cli/index.html
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pkl eval "$SCRIPT_DIR/config.pkl" -f json -o "config.json"
echo "Generated config.json"
