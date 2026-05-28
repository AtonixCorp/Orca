"""
================================================================================
 File: orcaapi/app/schemas/gps.py
 Purpose:
   Wire-format schemas for GPS ingestion and read APIs.
================================================================================
"""

from __future__ import annotations

from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field


class GPSPointIn(BaseModel):
    """Incoming GPS point from a tracker, drone, or edge device."""

    model_config = ConfigDict(extra="forbid")

    device_id: str = Field(..., min_length=3, max_length=128, examples=["drone-001"])
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    speed: float | None = Field(None, ge=0)
    heading: float | None = Field(None, ge=0, le=360)
    ts: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GPSPointOut(GPSPointIn):
    """GPS point as persisted by the platform."""

    id: int
    received_at: datetime


class GPSFleetLiveResponse(BaseModel):
    """Latest known position for currently active devices."""

    active_within_minutes: int
    devices: list[GPSPointOut]