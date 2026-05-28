"""
================================================================================
 File: orcaapi/app/api/v1/endpoints/gps.py
 Purpose:
   HTTP GPS ingestion and device tracking endpoints.

 Endpoints:
   POST /api/v1/ingest/gps                  Ingest one GPS point.
   GET  /api/v1/devices/{device_id}/last-position
   GET  /api/v1/devices/{device_id}/track
   GET  /api/v1/fleet/live
================================================================================
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_session
from app.schemas.gps import GPSFleetLiveResponse, GPSPointIn, GPSPointOut
from app.services.gps_tracking import gps_tracking_service

router = APIRouter()


@router.post(
    "/ingest/gps",
    response_model=GPSPointOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("operator"))],
    summary="Ingest a GPS point",
)
async def ingest_gps_point(
    point: GPSPointIn,
    session: AsyncSession = Depends(get_session),
) -> GPSPointOut:
    """Validate and persist one GPS point."""
    return await gps_tracking_service.ingest(session, point)


@router.get(
    "/devices/{device_id}/last-position",
    response_model=GPSPointOut,
    dependencies=[Depends(require_role("viewer"))],
    summary="Get the last known position for one device",
)
async def get_last_position(
    device_id: str,
    session: AsyncSession = Depends(get_session),
) -> GPSPointOut:
    """Return the latest stored position for the requested device."""
    point = await gps_tracking_service.get_last_position(session, device_id)
    if point is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No GPS points found for device '{device_id}'",
        )
    return point


@router.get(
    "/devices/{device_id}/track",
    response_model=list[GPSPointOut],
    dependencies=[Depends(require_role("viewer"))],
    summary="Get the historical track for one device",
)
async def get_device_track(
    device_id: str,
    from_ts: datetime | None = Query(None, alias="from"),
    to_ts: datetime | None = Query(None, alias="to"),
    limit: int = Query(1000, ge=1, le=5000),
    session: AsyncSession = Depends(get_session),
) -> list[GPSPointOut]:
    """Return GPS history for a device within the supplied time range."""
    return await gps_tracking_service.get_track(
        session,
        device_id,
        from_ts=from_ts,
        to_ts=to_ts,
        limit=limit,
    )


@router.get(
    "/fleet/live",
    response_model=GPSFleetLiveResponse,
    dependencies=[Depends(require_role("viewer"))],
    summary="Get the latest live position for all active devices",
)
async def get_live_fleet(
    active_within_minutes: int = Query(15, ge=1, le=1440),
    session: AsyncSession = Depends(get_session),
) -> GPSFleetLiveResponse:
    """Return the latest point per device for devices active in the window."""
    devices = await gps_tracking_service.get_live_fleet(
        session,
        active_within_minutes=active_within_minutes,
    )
    return GPSFleetLiveResponse(
        active_within_minutes=active_within_minutes,
        devices=devices,
    )