"""
================================================================================
 File: app/api/v1/endpoints/events.py
 Purpose:
   Live event, historical analytics, and alert APIs for dashboard/webapp.
================================================================================
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_session
from app.schemas.events import AlertEvent, HistoricalAnalyticsPoint, NormalizedEvent
from app.services.event_pipeline import event_pipeline_service

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