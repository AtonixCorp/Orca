#!/usr/bin/env bash

set -euo pipefail

stack_file="${1:-docker-compose.services.yml}"

docker compose -f "$stack_file" run --rm citosmart alembic upgrade head