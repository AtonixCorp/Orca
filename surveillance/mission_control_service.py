"""
================================================================================
 File: surveillance/mission_control_service.py
 Purpose:
   Mission Control Service for SmartCito. It validates patrol routes, tracks
   mission lifecycle, uploads missions through Drone Gateway, and exposes a
   monitoring-friendly API for the operator dashboard.
================================================================================
"""

from __future__ import annotations

import json
import os
from datetime import UTC, datetime
from pathlib import Path
from urllib import error, request

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

from surveillance.geospatial import resolve_zone
from surveillance.kafka import get_publisher
from surveillance.models import DroneMission, MissionStatus, MissionUploadRequest, MissionValidationResult, NormalizedEvent
from surveillance.topics import DRONE_EVENTS_TOPIC, DRONE_MISSIONS_TOPIC


load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

app = FastAPI(title="SmartCito Mission Control Service")
_missions: dict[str, DroneMission] = {}


def _gateway_base_url() -> str:
    return os.getenv("DRONE_GATEWAY_URL", "http://drone-gateway:8020").rstrip("/")


def _validate(request_payload: MissionUploadRequest, *, mission_id: str | None = None) -> MissionValidationResult:
    issues: list[str] = []
    zones: list[str] = []
    requires_operator_review = False

    for index, waypoint in enumerate(request_payload.waypoints, start=1):
        zone = resolve_zone(waypoint)
        zones.append(str(zone["zone_id"] or "outside-managed-zones"))
        if zone["criticality"] == "critical":
            requires_operator_review = True
            issues.append(f"waypoint {index} enters critical zone {zone['zone_id']}")

    unique_zones = sorted(set(zones))
    if request_payload.altitude_m > 120:
        requires_operator_review = True
        issues.append("mission altitude exceeds standard patrol ceiling of 120m")
    if request_payload.speed_mps > 20:
        issues.append("mission speed exceeds standard patrol profile of 20 m/s")
    if len(unique_zones) > 3:
        requires_operator_review = True
        issues.append("mission crosses multiple managed zones and requires review")

    return MissionValidationResult(
        mission_id=mission_id,
        valid=not issues,
        status=MissionStatus.DRAFT,
        issues=issues,
        zones=unique_zones,
        requires_operator_review=requires_operator_review,
    )


def _upload_to_gateway(mission: DroneMission) -> str:
    payload = {
        "drone_id": mission.drone_id,
        "action": "follow_path",
        "path": [waypoint.model_dump(mode="json", exclude_none=True) for waypoint in mission.waypoints],
        "requested_by": "mission-control",
    }
    body = json.dumps(payload).encode("utf-8")
    gateway_request = request.Request(
        url=f"{_gateway_base_url()}/drones/{mission.drone_id}/commands",
        data=body,
        headers={"content-type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(gateway_request, timeout=5) as response:
            response_body = json.loads(response.read().decode("utf-8") or "{}")
    except error.URLError as exc:
        return f"gateway-unavailable:{exc.reason}"
    except Exception as exc:  # pragma: no cover - defensive fallback for remote gateway issues
        return f"gateway-failed:{exc.__class__.__name__}"

    if response_body.get("accepted") is True:
        return "uploaded"
    return str(response_body.get("adapter_status", "gateway-rejected"))


def _publish_mission_event(mission: DroneMission, event_type: str, upload_status: str) -> dict[str, object]:
    event = NormalizedEvent(
        event_type=event_type,
        source="mission-control",
        entity_id=mission.mission_id,
        topic=DRONE_MISSIONS_TOPIC,
        payload={
            **mission.model_dump(mode="json"),
            "upload_status": upload_status,
        },
    )
    publish = get_publisher().publish_event(event)
    control_event = NormalizedEvent(
        event_type=f"mission.control.{mission.status.value}",
        source="mission-control",
        entity_id=mission.drone_id,
        topic=DRONE_EVENTS_TOPIC,
        payload={
            "mission_id": mission.mission_id,
            "drone_id": mission.drone_id,
            "status": mission.status.value,
            "upload_status": upload_status,
        },
    )
    get_publisher().publish_event(control_event)
    return {"event": event.model_dump(mode="json"), "publish": publish.model_dump(mode="json")}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "mission-control"}


@app.get("/ready")
async def ready() -> dict[str, object]:
    return {
        "service": "mission-control",
        "topics": {"missions": DRONE_MISSIONS_TOPIC, "events": DRONE_EVENTS_TOPIC},
        "gateway": _gateway_base_url(),
        "mission_count": len(_missions),
    }


@app.post("/missions/validate", response_model=MissionValidationResult)
async def validate_mission(request_payload: MissionUploadRequest) -> MissionValidationResult:
    return _validate(request_payload)


@app.get("/missions", response_model=list[DroneMission])
async def list_missions() -> list[DroneMission]:
    return sorted(_missions.values(), key=lambda mission: mission.updated_at, reverse=True)


@app.get("/missions/{mission_id}", response_model=DroneMission)
async def get_mission(mission_id: str) -> DroneMission:
    mission = _missions.get(mission_id)
    if mission is None:
        raise HTTPException(status_code=404, detail="mission not found")
    return mission


@app.post("/missions", response_model=DroneMission)
async def create_mission(request_payload: MissionUploadRequest) -> DroneMission:
    mission = DroneMission(
        drone_id=request_payload.drone_id,
        name=request_payload.name,
        altitude_m=request_payload.altitude_m,
        speed_mps=request_payload.speed_mps,
        waypoints=request_payload.waypoints,
    )
    validation = _validate(request_payload, mission_id=mission.mission_id)
    if validation.requires_operator_review:
        mission.validation = validation
        mission.updated_at = datetime.now(UTC)
        _missions[mission.mission_id] = mission
        _publish_mission_event(mission, "mission.review_required", "review-required")
        return mission

    upload_status = _upload_to_gateway(mission)
    mission.status = MissionStatus.UPLOADED if upload_status == "uploaded" else MissionStatus.FAILED
    mission.progress_percent = 5 if mission.status == MissionStatus.UPLOADED else 0
    mission.validation = validation.model_copy(update={"status": mission.status})
    mission.updated_at = datetime.now(UTC)
    _missions[mission.mission_id] = mission
    _publish_mission_event(mission, "mission.uploaded" if mission.status == MissionStatus.UPLOADED else "mission.upload_failed", upload_status)
    return mission


@app.post("/missions/{mission_id}/status", response_model=DroneMission)
async def update_mission_status(mission_id: str, status: MissionStatus, progress_percent: float | None = None) -> DroneMission:
    mission = _missions.get(mission_id)
    if mission is None:
        raise HTTPException(status_code=404, detail="mission not found")

    mission.status = status
    if progress_percent is not None:
        mission.progress_percent = progress_percent
    elif status == MissionStatus.COMPLETED:
        mission.progress_percent = 100
    mission.updated_at = datetime.now(UTC)
    _publish_mission_event(mission, "mission.status.updated", "operator-update")
    return mission