"""
================================================================================
 File: surveillance/mapping_service.py
 Purpose:
   Mapping and Geospatial Service for drone/sensor overlays, geofence
   resolution, routes, and heatmap-ready operator dashboard APIs.
================================================================================
"""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

from surveillance.geospatial import geofence_overlays, path_around, resolve_zone
from surveillance.kafka import get_publisher
from surveillance.models import DroneTelemetry, GeoPoint, MapOverlay, NormalizedEvent, SensorReading, SurveillanceOverview, ThreatAlert
from surveillance.topics import LOCATION_ENRICHED_TOPIC


load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

app = FastAPI(title="SmartCito Mapping and Geospatial Service")
_drones: dict[str, MapOverlay] = {}
_sensors: dict[str, MapOverlay] = {}
_threats: dict[str, MapOverlay] = {}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "mapping-geospatial"}


@app.get("/ready")
async def ready() -> dict[str, object]:
    return {
        "service": "mapping-geospatial",
        "providers": ["openstreetmap", "mapbox-compatible"],
        "topic": LOCATION_ENRICHED_TOPIC,
        "layers": ["drone-positions", "sensor-positions", "patrol-routes", "geofences", "heatmaps", "threats"],
    }


@app.post("/resolve")
async def resolve(position: GeoPoint) -> dict[str, object]:
    return {"coordinate_system": "WGS84", "position": position.model_dump(mode="json"), "zone": resolve_zone(position)}


@app.post("/overlays/drone")
async def upsert_drone_overlay(telemetry: DroneTelemetry) -> dict[str, object]:
    zone = resolve_zone(telemetry.position)
    overlay = MapOverlay(
        overlay_id=telemetry.drone_id,
        overlay_type="drone",
        label=f"Drone {telemetry.drone_id}",
        position=telemetry.position,
        path=path_around(telemetry.position),
        intensity=max(0.1, min(1, telemetry.battery_percent / 100)),
        metadata={
            "status": telemetry.status.value,
            "speed_mps": telemetry.speed_mps,
            "heading_deg": telemetry.heading_deg,
            "battery_percent": telemetry.battery_percent,
            "zone": zone,
        },
    )
    _drones[telemetry.drone_id] = overlay
    event = NormalizedEvent(
        event_type="location.drone.enriched",
        source="mapping-geospatial",
        entity_id=telemetry.drone_id,
        topic=LOCATION_ENRICHED_TOPIC,
        payload=overlay.model_dump(mode="json"),
    )
    publish = get_publisher().publish_event(event)
    return {"overlay": overlay.model_dump(mode="json"), "publish": publish.model_dump(mode="json")}


@app.post("/overlays/sensor")
async def upsert_sensor_overlay(reading: SensorReading) -> dict[str, object]:
    overlay = MapOverlay(
        overlay_id=reading.device_id,
        overlay_type="sensor",
        label=f"{reading.sensor_type} sensor {reading.device_id}",
        position=reading.position,
        intensity=1 if reading.alert else min(1, abs(reading.value) / 100),
        metadata={
            "sensor_type": reading.sensor_type,
            "value": reading.value,
            "unit": reading.unit,
            "alert": reading.alert,
            "zone": resolve_zone(reading.position),
        },
    )
    _sensors[reading.device_id] = overlay
    event = NormalizedEvent(
        event_type="location.sensor.enriched",
        source="mapping-geospatial",
        entity_id=reading.device_id,
        topic=LOCATION_ENRICHED_TOPIC,
        payload=overlay.model_dump(mode="json"),
    )
    publish = get_publisher().publish_event(event)
    return {"overlay": overlay.model_dump(mode="json"), "publish": publish.model_dump(mode="json")}


@app.post("/overlays/threat")
async def upsert_threat_overlay(alert: ThreatAlert) -> dict[str, object]:
    overlay = MapOverlay(
        overlay_id=alert.alert_id,
        overlay_type="threat",
        label=alert.title,
        position=alert.position,
        intensity=alert.confidence,
        metadata={
            "threat_level": alert.threat_level.value,
            "zone": alert.zone,
            "source_ids": alert.source_ids,
            "recommended_actions": alert.recommended_actions,
        },
    )
    _threats[alert.alert_id] = overlay
    return {"overlay": overlay.model_dump(mode="json")}


@app.get("/overlays", response_model=SurveillanceOverview)
async def overlays() -> SurveillanceOverview:
    return SurveillanceOverview(
        drones=list(_drones.values()),
        sensors=list(_sensors.values()),
        threats=list(_threats.values()),
        geofences=geofence_overlays(),
    )
