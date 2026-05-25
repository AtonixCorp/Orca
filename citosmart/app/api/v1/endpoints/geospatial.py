"""
================================================================================
 File: citosmart/app/api/v1/endpoints/geospatial.py
 Purpose:
   CRUD-style API for persisted geospatial features and grouped map datasets.
================================================================================
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.db.session import get_session
from app.schemas.geospatial import GeoDatasetOut, GeoFeatureIn, GeoFeatureOut, GeoFeatureType
from app.services.geospatial_registry import geospatial_registry_service

router = APIRouter()


@router.post(
    "/features",
    response_model=GeoFeatureOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("operator"))],
    summary="Create or update a persisted geographic feature",
)
async def upsert_geo_feature(feature: GeoFeatureIn, session: AsyncSession = Depends(get_session)) -> GeoFeatureOut:
    return await geospatial_registry_service.upsert_feature(session, feature)


@router.get(
    "/features",
    response_model=list[GeoFeatureOut],
    dependencies=[Depends(require_role("viewer"))],
    summary="List persisted geographic features",
)
async def list_geo_features(
    feature_type: GeoFeatureType | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> list[GeoFeatureOut]:
    return await geospatial_registry_service.list_features(session, feature_type=feature_type)


@router.get(
    "/dataset",
    response_model=GeoDatasetOut,
    dependencies=[Depends(require_role("viewer"))],
    summary="Return grouped geospatial datasets for maps and geographic services",
)
async def get_geo_dataset(session: AsyncSession = Depends(get_session)) -> GeoDatasetOut:
    return await geospatial_registry_service.dataset(session)