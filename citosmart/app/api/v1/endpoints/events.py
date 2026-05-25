"""
================================================================================
 File: app/api/v1/endpoints/events.py
 Purpose:
   Live event, historical analytics, and alert APIs for dashboard/webapp.
================================================================================
"""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import decode_token
from app.core.security import require_role
from app.db.session import get_session
from app.schemas.events import AlertEvent, HistoricalAnalyticsPoint, NormalizedEvent
from app.services.event_pipeline import event_pipeline_service
from app.services.realtime_bus import realtime_bus_service

router = APIRouter()


@router.get(
    "/live",
    response_model=list[NormalizedEvent],
    dependencies=[Depends(require_role("viewer"))],
    summary="Return recent live events",
)
async def live_events(limit: int = Query(25, ge=1, le=200)) -> list[NormalizedEvent]:
    return list(event_pipeline_service.live_events(limit=limit))


@router.get(
    "/history",
    response_model=list[HistoricalAnalyticsPoint],
    dependencies=[Depends(require_role("viewer"))],
    summary="Return historical analytics for processed events",
)
async def history(
    limit: int = Query(20, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
) -> list[HistoricalAnalyticsPoint]:
    return await event_pipeline_service.historical_analytics(session, limit=limit)


@router.get(
    "/alerts",
    response_model=list[AlertEvent],
    dependencies=[Depends(require_role("viewer"))],
    summary="Return recent alert events",
)
async def alerts(limit: int = Query(25, ge=1, le=100)) -> list[AlertEvent]:
    return list(event_pipeline_service.alerts(limit=limit))


@router.websocket("/stream")
async def stream_events(websocket: WebSocket, token: str | None = Query(default=None)) -> None:
    raw_token = token
    if raw_token is None:
        authorization = websocket.headers.get("authorization", "")
        if authorization.lower().startswith("bearer "):
            raw_token = authorization.split(" ", 1)[1]

    if raw_token is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        decode_token(raw_token)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    settings = get_settings()

    try:
        while True:
            await websocket.send_json(await realtime_bus_service.snapshot())
            await asyncio.sleep(settings.realtime_snapshot_interval_seconds)
    except WebSocketDisconnect:
        return