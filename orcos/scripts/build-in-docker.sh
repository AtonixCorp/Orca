#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_TAG="orcos-toolchain:latest"

cd "$ROOT_DIR"

docker build -t "$IMAGE_TAG" -f Dockerfile.toolchain .
docker run --rm -v "$ROOT_DIR":/workspace -w /workspace "$IMAGE_TAG" make all
