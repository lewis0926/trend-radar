#!/usr/bin/env bash
# Usage:
#   ./deploy/deploy.sh                           # both images → latest
#   ./deploy/deploy.sh abc1234                   # both images → abc1234
#   ./deploy/deploy.sh abc1234 def5678           # backend → abc1234, frontend → def5678
#   ./deploy/deploy.sh --upload                  # upload config + deploy latest
#   ./deploy/deploy.sh --upload abc1234          # upload config + deploy tag
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
YAML="$SCRIPT_DIR/deploy.yaml"
REMOTE="k3s-oracle-cloud"
REMOTE_DIR="/home/ubuntu/apps/trend-radar"
OWNER="lewis0926"
UPLOAD=false

ARGS=()
for arg in "$@"; do
  [[ "$arg" == "--upload" ]] && UPLOAD=true || ARGS+=("$arg")
done

BACKEND_TAG="${ARGS[0]:-latest}"
FRONTEND_TAG="${ARGS[1]:-$BACKEND_TAG}"

export INGRESS_HOST="trend-radar.lewisshum.com"
export BACKEND_IMAGE="ghcr.io/$OWNER/trend-radar-backend-main:$BACKEND_TAG"
export FRONTEND_IMAGE="ghcr.io/$OWNER/trend-radar-frontend-main:$FRONTEND_TAG"

if [[ "$UPLOAD" == true ]]; then
  "$SCRIPT_DIR/upload-config.sh" --secret
  echo ""
fi

echo "Backend:  $BACKEND_IMAGE"
echo "Frontend: $FRONTEND_IMAGE"
echo ""

# Substitute image vars, SCP the rendered YAML, then apply it
RENDERED="$(envsubst '${BACKEND_IMAGE}${FRONTEND_IMAGE}${INGRESS_HOST}' < "$YAML")"

echo "$RENDERED" | ssh "$REMOTE" "cat > $REMOTE_DIR/deploy.yaml"
echo "Uploaded k3s.yaml → $REMOTE:$REMOTE_DIR/deploy.yaml"

ssh "$REMOTE" "sudo kubectl apply -f $REMOTE_DIR/deploy.yaml"
