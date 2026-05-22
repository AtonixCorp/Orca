# Security: Location Intelligence

- All location events are HMAC-signed using `ATP_SECRET`.
- Devices must be authenticated before logging (`authenticated: true`).
- Location data is timestamped and appended to per-device ledger files.
- IP geolocation requests must use HTTPS providers.
- No device appears on the map unless its source is validated.
- Rotate `ATP_SECRET` regularly and store it in a secrets manager.
