#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
K8S_DIR="$ROOT_DIR/infra/kubernetes"
KIND_NAME="${KIND_NAME:-smartcito}"
KIND_VERSION="${KIND_VERSION:-v0.23.0}"
KIND_BIN="${KIND_BIN:-$ROOT_DIR/.bin/kind}"
KIND_GATEWAY_PORT="${KIND_GATEWAY_PORT:-18088}"
CNPG_OPERATOR_MANIFEST_URL="${CNPG_OPERATOR_MANIFEST_URL:-https://raw.githubusercontent.com/cloudnative-pg/artifacts/release-1.29/manifests/operator-manifest.yaml}"

log() {
  printf '[smartcito-k8s] %s\n' "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

install_kind_if_needed() {
  if command -v kind >/dev/null 2>&1; then
    KIND_CMD="$(command -v kind)"
    return
  fi

  mkdir -p "$(dirname "$KIND_BIN")"

  if [[ ! -x "$KIND_BIN" ]]; then
    log "Installing kind ${KIND_VERSION} to $KIND_BIN"
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL -o "$KIND_BIN" "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64"
    elif command -v wget >/dev/null 2>&1; then
      wget -qO "$KIND_BIN" "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-amd64"
    else
      printf 'kind is not installed and neither curl nor wget is available\n' >&2
      exit 1
    fi
    chmod +x "$KIND_BIN"
  fi

  KIND_CMD="$KIND_BIN"
}

preload_local_images() {
  local current_context
  current_context="$(kubectl config current-context 2>/dev/null || true)"
  if [[ "$current_context" != kind-* ]]; then
    return
  fi

  install_kind_if_needed

  local images=()
  while IFS= read -r image; do
    images+=("$image")
  done < <(docker image ls --format '{{.Repository}}:{{.Tag}}' | grep '^atonixdev/' | sort -u || true)

  if [[ ${#images[@]} -eq 0 ]]; then
    return
  fi

  log "Loading ${#images[@]} local SmartCito images into kind"
  "$KIND_CMD" load docker-image --name "$KIND_NAME" "${images[@]}"
}

fetch_url_to_stdout() {
  local url="$1"
  if command -v curl >/dev/null 2>&1; then
    curl -sSfL "$url"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- "$url"
  else
    printf 'Missing curl or wget for fetching %s\n' "$url" >&2
    exit 1
  fi
}

install_cnpg_operator() {
  if kubectl get deployment -n cnpg-system cnpg-controller-manager >/dev/null 2>&1; then
    log "CloudNativePG operator already installed"
  else
    log "Installing CloudNativePG operator"
    fetch_url_to_stdout "$CNPG_OPERATOR_MANIFEST_URL" | kubectl apply --server-side -f -
  fi

  kubectl rollout status deployment/cnpg-controller-manager -n cnpg-system --timeout=300s
}

migrate_local_database() {
  if kubectl get statefulset -n database postgres >/dev/null 2>&1; then
    log "Removing legacy local postgres StatefulSet before applying CNPG cluster"
    kubectl delete statefulset -n database postgres --ignore-not-found --wait=true
    kubectl delete service -n database postgres --ignore-not-found --wait=true
    kubectl delete service -n database postgres-primary --ignore-not-found --wait=true
    kubectl delete service -n database postgres-replica --ignore-not-found --wait=true
  fi
}

ensure_cluster() {
  if kubectl cluster-info >/dev/null 2>&1; then
    log "Using existing Kubernetes context: $(kubectl config current-context 2>/dev/null || echo unknown)"
    return
  fi

  install_kind_if_needed

  local config_file
  config_file="$(mktemp)"
  cat >"$config_file" <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: ${KIND_NAME}
nodes:
- role: control-plane
  extraMounts:
  - hostPath: ${ROOT_DIR}
    containerPath: /workspace/smartcito
  extraPortMappings:
  - containerPort: 30081
    hostPort: ${KIND_GATEWAY_PORT}
    listenAddress: "127.0.0.1"
    protocol: TCP
EOF

  log "Creating kind cluster ${KIND_NAME}"
  "$KIND_CMD" create cluster --name "$KIND_NAME" --config "$config_file"
  rm -f "$config_file"
}

wait_for_rollout() {
  local namespace="$1"
  local resource="$2"
  kubectl rollout status -n "$namespace" "$resource" --timeout=300s
}

wait_for_cnpg_cluster() {
  kubectl wait --for=condition=Ready cluster/postgres -n database --timeout=600s
}

main() {
  require_command kubectl
  require_command docker

  ensure_cluster
  preload_local_images
  install_cnpg_operator
  migrate_local_database

  log "Applying local SmartCito overlay"
  kubectl kustomize --load-restrictor LoadRestrictionsNone "$K8S_DIR/local" | kubectl apply -f -

  log "Waiting for core workloads"
  wait_for_cnpg_cluster
  wait_for_rollout data-platform deployment/kafka
  wait_for_rollout data-platform statefulset/memcached
  wait_for_rollout backend deployment/citosmart-api
  wait_for_rollout ingestion deployment/camera-service
  wait_for_rollout ingestion deployment/gps-service
  wait_for_rollout ai deployment/ai-service
  wait_for_rollout security deployment/security-service
  wait_for_rollout visualization deployment/frontend-service
  wait_for_rollout visualization deployment/visualization-gateway

  log "Current pod status"
  kubectl get pods -A

  log "Visualization gateway: http://127.0.0.1:${KIND_GATEWAY_PORT}"
}

main "$@"