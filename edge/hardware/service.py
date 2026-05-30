"""
================================================================================
 File: hardware/service.py
 Purpose:
   Minimal FastAPI hardware-domain service exposing demo monitoring samples.
================================================================================
"""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from dotenv import load_dotenv

from hardware.drone_edge.manufacturer_spec import build_manufacturer_spec
from hardware.drone_edge.reference import build_reference_stack
from hardware.drone_edge.rfp_packet import build_rfp_packet
from hardware.drone_edge.ros2_contract import build_ros2_node_contract
from hardware.monitoring.agent import collect_sample
from orca_shared.identity import bootstrap_process_identity, identity_posture


load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

PROCESS_IDENTITY = bootstrap_process_identity(
    component_type="agent",
    role="orca.agent",
    description="ORCA hardware monitoring agent",
)

app = FastAPI(title="Orca Hardware Domain")


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "hardware-domain",
        "upi": PROCESS_IDENTITY.upi,
        "role": PROCESS_IDENTITY.role,
    }


@app.get("/health/identity")
async def health_identity() -> dict[str, object]:
    return identity_posture(PROCESS_IDENTITY)


@app.get("/monitoring/sample")
async def sample() -> dict[str, object]:
    sample = collect_sample("rack-a1")
    return {
        "rack_id": sample.rack_id,
        "temperature_c": sample.temperature_c,
        "power_kw": sample.power_kw,
    }


@app.get("/drone-edge/reference-stack")
async def drone_edge_reference_stack() -> dict[str, object]:
    return build_reference_stack()


@app.get("/drone-edge/hardware-spec")
async def drone_edge_hardware_spec() -> dict[str, object]:
    return build_manufacturer_spec()


@app.get("/drone-edge/ros2-contract")
async def drone_edge_ros2_contract() -> dict[str, object]:
    return build_ros2_node_contract()


@app.get("/drone-edge/rfp-packet")
async def drone_edge_rfp_packet() -> dict[str, object]:
    return build_rfp_packet()
