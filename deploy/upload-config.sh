#!/usr/bin/env bash
# Usage:
#   ./deploy/upload-config.sh           # SCP config.json to server
#   ./deploy/upload-config.sh --secret  # SCP + update backend-config Secret in k3s
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/../backend/config.json"
REMOTE="k3s-oracle-cloud"
REMOTE_DIR="/home/ubuntu/trend-radar"
APPLY_SECRET=false

for arg in "$@"; do
  [[ "$arg" == "--secret" ]] && APPLY_SECRET=true
done

if [[ ! -f "$CONFIG" ]]; then
  echo "error: $CONFIG not found — regenerate it first:" >&2
  echo "  cd backend && pkl eval config/dev.pkl -f json -o config.json" >&2
  exit 1
fi

echo "Uploading config.json → $REMOTE:$REMOTE_DIR/"
scp "$CONFIG" "$REMOTE:$REMOTE_DIR/config.json"
echo "Done."

if [[ "$APPLY_SECRET" == true ]]; then
  echo "Updating backend-config Secret in k3s..."
  ssh "$REMOTE" "
    sudo kubectl create secret generic backend-config \
      --from-file=config.json=$REMOTE_DIR/config.json \
      -n trend-radar \
      --dry-run=client -o yaml | sudo kubectl apply -f -
  "
  echo "Secret updated."
fi
