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

from hardware.monitoring.agent import collect_sample


load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

app = FastAPI(title="SmartCito Hardware Domain")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "hardware-domain"}


@app.get("/monitoring/sample")
async def sample() -> dict[str, object]:
    sample = collect_sample("rack-a1")
    return {
        "rack_id": sample.rack_id,
        "temperature_c": sample.temperature_c,
        "power_kw": sample.power_kw,
    }
