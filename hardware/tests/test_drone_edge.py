from hardware.drone_edge.companion import DroneCompanionRuntime
from hardware.drone_edge.mavlink_bridge import build_drone_profile, normalize_mavlink_telemetry
from hardware.drone_edge.schemas import CameraStreamProfile, GeoPoint, SensorSnapshot
from hardware.drone_edge.sdk import SmartCitoDroneSDK


class RecordingDroneSDK(SmartCitoDroneSDK):
    def __init__(self) -> None:
        super().__init__()
        self.calls: list[tuple[str, dict[str, object]]] = []

    def _request_json(self, method: str, url: str, payload: dict[str, object] | None = None) -> dict[str, object]:
        self.calls.append((url, payload or {}))
        return {"method": method, "url": url, "payload": payload or {}}


def test_normalize_mavlink_telemetry() -> None:
    telemetry = normalize_mavlink_telemetry(
        drone_id="drone-edge-001",
        mavlink_payload={
            "latitude": -25.7454,
            "longitude": 28.2438,
            "relative_alt_m": 95,
            "groundspeed_mps": 7.8,
            "heading_deg": 42,
            "battery_remaining_pct": 83,
            "flight_mode": "patrol",
            "status": "in_mission",
            "link_quality": 0.91,
            "gps_lock": True,
            "ekf_ok": False,
        },
    )

    payload = telemetry.to_gateway_payload()
    assert payload["drone_id"] == "drone-edge-001"
    assert payload["position"]["altitude_m"] == 95
    assert payload["battery_percent"] == 83
    assert "ekf_ok" in payload["health_flags"]


def test_companion_runtime_bootstraps_and_uplinks() -> None:
    sdk = RecordingDroneSDK()
    profile = build_drone_profile(
        drone_id="drone-edge-002",
        mavlink_endpoint="udp://0.0.0.0:14540",
        autopilot_payload={"model": "PX4 Patrol Airframe", "firmware_version": "px4-1.15.2", "thermal_camera": True},
    )
    runtime = DroneCompanionRuntime(
        sdk=sdk,
        drone_profile=profile,
        camera_profile=CameraStreamProfile(
            drone_id="drone-edge-002",
            stream_url="rtsp://127.0.0.1:8554/main",
            position=GeoPoint(latitude=-25.7454, longitude=28.2438, altitude_m=95),
        ),
    )

    bootstrap = runtime.bootstrap()
    assert bootstrap["connect"]["payload"]["protocol"] == "mavlink"
    assert bootstrap["capabilities"]["payload"]["status"] == "online"

    uplink = runtime.uplink_snapshot(
        mavlink_payload={
            "latitude": -25.7454,
            "longitude": 28.2438,
            "relative_alt_m": 95,
            "groundspeed_mps": 8.4,
            "heading_deg": 90,
            "battery_remaining_pct": 88,
            "flight_mode": "patrol",
            "status": "in_mission",
        },
        sensor_snapshots=[
            SensorSnapshot(
                device_id="drone-edge-002-imu",
                sensor_type="imu-vibration",
                position=GeoPoint(latitude=-25.7454, longitude=28.2438, altitude_m=95),
                value=0.14,
                unit="g",
            )
        ],
        frame_size=(1280, 720),
    )

    assert uplink["telemetry"]["payload"]["drone_id"] == "drone-edge-002"
    assert uplink["frame"]["payload"]["width"] == 1280
    assert uplink["sensors"][0]["payload"]["sensor_type"] == "imu-vibration"
    assert len(sdk.calls) >= 5