#!/bin/zsh
set -u
mkdir -p .docker-build-logs/compose-targets

build_and_tag() {
  local primary_tag="$1"
  local context="$2"
  local dockerfile="$3"
  shift 3
  local extra_tags=("$@")
  local safe_name="${primary_tag//\//__}"
  safe_name="${safe_name//:/__}"
  local log_file=".docker-build-logs/compose-targets/${safe_name}.log"

  echo "BUILDING|${primary_tag}|${dockerfile}|${context}"
  if docker build -f "$dockerfile" -t "$primary_tag" "$context" >"$log_file" 2>&1; then
    echo "PASS|${primary_tag}"
    for tag in "${extra_tags[@]}"; do
      docker tag "$primary_tag" "$tag"
      echo "TAGGED|${tag}|from|${primary_tag}"
    done
  else
    echo "FAIL|${primary_tag}"
    tail -n 20 "$log_file"
  fi
}

build_and_tag 'orca/frontend-service:local' './webapp' 'Dockerfile' 'orca/frontend-service:hardware'
build_and_tag 'orca/drone-gateway:local' '.' 'surveillance/Dockerfile' 'orca/sensor-gateway:local' 'orca/drone-camera-ingestion:local' 'orca/threat-detection:local' 'orca/mapping-geospatial:local' 'orca/mission-control:local'
build_and_tag 'orca/ingestion-spark:local' '.' 'ingestion/Dockerfile.spark'
