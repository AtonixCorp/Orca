# SmartCito Drone Edge Stack

This folder is the non-container drone-side runtime for SmartCito.

It represents the hardware and communication layers from the drone brief:

- PX4 Autopilot on the flight controller
- ROS2 autonomy nodes on the companion computer for SLAM, obstacle avoidance, and visual odometry
- MAVLink telemetry between PX4 and the companion runtime
- IMU, GPS, barometer, and magnetometer telemetry packaged into SmartCito payloads
- RGB, thermal, and zoom camera stream registration for RTSP or WebRTC uplink
- 4G, 5G, or WiFi transport into the SmartCito cloud services
- a custom SmartCito drone SDK for telemetry, sensor, and video registration

## Layout

- `schemas.py`: edge-side payload models for telemetry, sensors, and camera streams.
- `mavlink_bridge.py`: normalizes MAVLink-style flight payloads and autopilot metadata.
- `sdk.py`: SmartCito cloud uplink SDK for Drone Gateway, Sensor Gateway, and Camera Service.
- `companion.py`: PX4/ROS2 companion runtime that boots the uplink path and ships snapshots to the cloud.
- `reference.py`: reference stack contract returned by the hardware-domain API.

## Operating Model

The drone companion computer owns all communication from drone hardware into SMARTCITO:

1. PX4 publishes flight telemetry over MAVLink.
2. ROS2 autonomy nodes provide local perception and navigation status.
3. `mavlink_bridge.py` converts those payloads into SmartCito telemetry and capability records.
4. `SmartCitoDroneSDK` registers the drone with Drone Gateway.
5. The same SDK pushes telemetry to Drone Gateway, sensor snapshots to Sensor Gateway, and camera streams/frame metadata to Drone Camera Ingestion.
6. Mission commands still flow from Mission Control to Drone Gateway only, which keeps the cloud-side control path centralized.

## Example

```python
from hardware.drone_edge.companion import DroneCompanionRuntime
from hardware.drone_edge.mavlink_bridge import build_drone_profile
from hardware.drone_edge.schemas import CameraStreamProfile, GeoPoint, SensorSnapshot
from hardware.drone_edge.sdk import SmartCitoDroneSDK

profile = build_drone_profile(
    drone_id="drone-patrol-001",
    mavlink_endpoint="udp://0.0.0.0:14540",
    autopilot_payload={
        "model": "PX4 Patrol Airframe",
        "firmware_version": "px4-1.15.2",
        "thermal_camera": True,
        "zoom_camera": True,
    },
)

sdk = SmartCitoDroneSDK(
    drone_gateway_base_url="http://gateway.smartcito.local/drone-gateway",
    sensor_gateway_base_url="http://gateway.smartcito.local/sensor-gateway",
    camera_service_base_url="http://gateway.smartcito.local/drone-camera",
)

runtime = DroneCompanionRuntime(
    sdk=sdk,
    drone_profile=profile,
    camera_profile=CameraStreamProfile(
        drone_id="drone-patrol-001",
        stream_url="rtsp://127.0.0.1:8554/main",
        position=GeoPoint(latitude=-25.7454, longitude=28.2438, altitude_m=95),
    ),
)

runtime.bootstrap()
runtime.uplink_snapshot(
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
            device_id="drone-patrol-001-imu",
            sensor_type="imu-vibration",
            position=GeoPoint(latitude=-25.7454, longitude=28.2438, altitude_m=95),
            value=0.12,
            unit="g",
        )
    ],
    frame_size=(1280, 720),
)
```

## Validation Scope

This repo does not build PX4 firmware or ROS2 packages directly. Instead, it implements the SmartCito-owned integration layer between those drone runtimes and the SmartCito cloud platform.