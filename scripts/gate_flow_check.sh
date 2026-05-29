#!/usr/bin/env bash
set -euo pipefail

# End-to-end gate-flow verifier for local docker compose deployments.

BASE_URL="${1:-http://localhost:8000}"
WEBAPP_URL="${2:-http://localhost:5173}"

log() {
  printf '[gate-check] %s\n' "$1"
}

require_http_200() {
  local url="$1"
  local code
  code=$(curl -sS -o /tmp/gate-check-body.txt -w '%{http_code}' "$url")
  if [[ "$code" != "200" ]]; then
    log "FAILED $url status=$code"
    cat /tmp/gate-check-body.txt || true
    exit 1
  fi
  log "OK $url"
}

wait_for_ready() {
  local url="$1"
  local attempts="${2:-40}"
  local i
  for ((i=1; i<=attempts; i++)); do
    if curl -sS -o /tmp/gate-check-ready.txt -w '%{http_code}' "$url" | grep -q '^200$'; then
      log "READY $url"
      return 0
    fi
    log "waiting for ready ($i/$attempts): $url"
    sleep 1
  done
  log "FAILED waiting for readiness: $url"
  cat /tmp/gate-check-ready.txt || true
  exit 1
}

require_ws_upgrade() {
  local url="$1"
  local hdr
  hdr=$(curl -sS -o /tmp/gate-check-ws.out -D - \
    -H 'Connection: Upgrade' \
    -H 'Upgrade: websocket' \
    -H 'Sec-WebSocket-Version: 13' \
    -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
    "$url" --max-time 3 || true)

  if ! grep -q '101 Switching Protocols' <<<"$hdr"; then
    log "FAILED websocket upgrade $url"
    printf '%s\n' "$hdr"
    exit 1
  fi
  log "OK websocket $url"
}

log "Checking core gateway endpoints"
require_http_200 "$BASE_URL/__router/health"
wait_for_ready "$BASE_URL/api/v1/health/ready"
require_http_200 "$BASE_URL/api/v1/health/live"
require_http_200 "$BASE_URL/api/v1/health/ready"
require_http_200 "$BASE_URL/api/v1/health/status"

log "Checking webapp gateway path"
require_http_200 "$WEBAPP_URL/"

log "Checking websocket flows"
require_ws_upgrade "$WEBAPP_URL/api/v1/events/stream/drone"
for channel in drone robot city mission individualization; do
  require_ws_upgrade "$WEBAPP_URL/api/v1/gps/stream/$channel"
done

log "Gate flow check PASSED"
