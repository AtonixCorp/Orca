# Deployment Scripts

This folder contains the deploy tooling used by CI/CD to roll SmartCito out to
OpenStack VMs.

## Expected inputs

- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`
- `IMAGE_REGISTRY`, `IMAGE_TAG`
- `APP_ENV`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `KAFKA_BROKER_URL` or `MESSAGE_BUS_URL`
- `OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_BUCKET`
- `AUTH_JWT_SECRET`, `AUTH_ISSUER`, `AUTH_AUDIENCE`

## Scripts

- `deploy_remote.sh`: SSH entrypoint used by CI/CD.
- `update_stack.sh`: Pulls new images and restarts the stack with minimal downtime.
- `run_migrations.sh`: Applies backend database migrations before traffic settles.