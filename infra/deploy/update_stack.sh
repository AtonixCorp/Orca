#!/usr/bin/env bash

set -euo pipefail

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${IMAGE_REGISTRY:?IMAGE_REGISTRY is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

cd "$DEPLOY_PATH"

cat > .env <<EOF
APP_ENV=${APP_ENV:-staging}
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-smartcito}
DB_PASSWORD=${DB_PASSWORD:-change-me}
DB_NAME=${DB_NAME:-smartcito}
KAFKA_BROKER_URL=${KAFKA_BROKER_URL:-kafka:9092}
MESSAGE_BUS_URL=${MESSAGE_BUS_URL:-${KAFKA_BROKER_URL:-kafka:9092}}
OBJECT_STORAGE_ENDPOINT=${OBJECT_STORAGE_ENDPOINT:-file:///srv/smartcito/object_storage}
OBJECT_STORAGE_BUCKET=${OBJECT_STORAGE_BUCKET:-smartcito-artifacts}
AUTH_JWT_SECRET=${AUTH_JWT_SECRET:-change-me}
AUTH_ISSUER=${AUTH_ISSUER:-smartcito.local}
AUTH_AUDIENCE=${AUTH_AUDIENCE:-smartcito-clients}
SECRET_KEY=${AUTH_JWT_SECRET:-change-me}
POSTGRES_HOST=${DB_HOST:-postgres}
POSTGRES_PORT=${DB_PORT:-5432}
POSTGRES_USER=${DB_USER:-smartcito}
POSTGRES_PASSWORD=${DB_PASSWORD:-change-me}
POSTGRES_DB=${DB_NAME:-smartcito}
KAFKA_BOOTSTRAP_SERVERS=${KAFKA_BROKER_URL:-kafka:9092}
CITOSMART_IMAGE=${IMAGE_REGISTRY}/citosmart:${IMAGE_TAG}
WEBAPP_IMAGE=${IMAGE_REGISTRY}/webapp:${IMAGE_TAG}
CAMERA_IMAGE=${IMAGE_REGISTRY}/camera-service:${IMAGE_TAG}
GPS_IMAGE=${IMAGE_REGISTRY}/gps-service:${IMAGE_TAG}
AI_IMAGE=${IMAGE_REGISTRY}/ai-service:${IMAGE_TAG}
SECURITY_IMAGE=${IMAGE_REGISTRY}/security-service:${IMAGE_TAG}
HARDWARE_IMAGE=${IMAGE_REGISTRY}/hardware-agent:${IMAGE_TAG}
INGESTION_KAFKA_PRODUCER_IMAGE=${IMAGE_REGISTRY}/ingestion-kafka-producer:${IMAGE_TAG}
INGESTION_SPARK_IMAGE=${IMAGE_REGISTRY}/ingestion-spark:${IMAGE_TAG}
EOF

docker compose -f docker-compose.services.yml pull
bash infra/deploy/run_migrations.sh docker-compose.services.yml
docker compose -f docker-compose.services.yml up -d --remove-orphans --wait