"""
================================================================================
 File: surveillance/adapters.py
 Purpose:
   Vendor-agnostic drone adapter contracts for the Drone Gateway. Real MAVLink,
   vendor SDK, REST, or WebSocket integrations plug in behind this interface;
   the gateway API remains stable for the rest of SmartCito.
================================================================================
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Protocol

from surveillance.models import DroneCapabilities, DroneCommand, DroneConnectionRequest, DroneRegistryStatus


class DroneAdapter(Protocol):
    protocol: str

    def discover_capabilities(self, request: DroneConnectionRequest) -> DroneCapabilities:
        ...

    def send_command(self, command: DroneCommand) -> str:
        ...


class SimulatedDroneAdapter:
    protocol = "simulated"

    def discover_capabilities(self, request: DroneConnectionRequest) -> DroneCapabilities:
        return DroneCapabilities(
            drone_id=request.drone_id,
            model="SmartCito Simulated Patrol Drone",
            firmware_version="sim-1.0.0",
            max_speed_mps=18.0,
            max_altitude_m=500.0,
            battery_capacity_mah=6000,
            camera_types=["rgb", "thermal", "zoom"],
            sensors=["gps", "imu", "barometer", "magnetometer", "link-quality"],
            payload_supported=True,
            status=DroneRegistryStatus.ONLINE,
            protocol=self.protocol,
            last_seen_at=datetime.now(UTC),
        )

    def send_command(self, command: DroneCommand) -> str:
        return f"simulated-command-accepted:{command.action.value}"


class RestDroneAdapter(SimulatedDroneAdapter):
    protocol = "rest"


class MavlinkDroneAdapter(SimulatedDroneAdapter):
    protocol = "mavlink"


class WebSocketDroneAdapter(SimulatedDroneAdapter):
    protocol = "websocket"


class VendorSdkDroneAdapter(SimulatedDroneAdapter):
    protocol = "vendor-sdk"


_ADAPTERS: dict[str, DroneAdapter] = {
    "simulated": SimulatedDroneAdapter(),
    "rest": RestDroneAdapter(),
    "mavlink": MavlinkDroneAdapter(),
    "websocket": WebSocketDroneAdapter(),
    "vendor-sdk": VendorSdkDroneAdapter(),
}


def adapter_for(protocol: str) -> DroneAdapter:
    return _ADAPTERS.get(protocol, _ADAPTERS["simulated"])


def supported_protocols() -> list[str]:
    return sorted(_ADAPTERS)
