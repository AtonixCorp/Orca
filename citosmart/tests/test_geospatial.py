"""
================================================================================
 File: citosmart/tests/test_geospatial.py
 Purpose: Focused tests for persisted geospatial registry endpoints.
================================================================================
"""

from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.security import create_access_token
from app.db.base import Base
from app.db.session import get_session
from app.main import app


@pytest.fixture()
def client(tmp_path: Path) -> Generator[TestClient, None, None]:
    db_path = tmp_path / "geospatial-tests.db"
    engine = create_async_engine(f"sqlite+aiosqlite:///{db_path}")
    session_factory = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

    async def _override_get_session():
        async with session_factory() as session:
            yield session

    async def _setup() -> None:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def _teardown() -> None:
        await engine.dispose()

    import asyncio

    asyncio.run(_setup())
    app.dependency_overrides[get_session] = _override_get_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    asyncio.run(_teardown())


def _auth_headers(role: str) -> dict[str, str]:
    token = create_access_token(subject=f"{role}@smartcito.dev", role=role)
    return {"Authorization": f"Bearer {token}"}


def test_geospatial_dataset_seeds_demo_features(client: TestClient) -> None:
    response = client.get("/api/v1/geospatial/dataset", headers=_auth_headers("viewer"))

    assert response.status_code == 200
    payload = response.json()
    assert payload["geofences"]
    assert payload["zones"]
    assert payload["sensors"]
    assert payload["mission_routes"]
    assert payload["geojson_layers"]["geofence"]["features"]


def test_geospatial_upsert_persists_custom_feature(client: TestClient) -> None:
    response = client.post(
        "/api/v1/geospatial/features",
        headers=_auth_headers("operator"),
        json={
            "feature_id": "geo-camera-custom-001",
            "name": "Custom Camera",
            "feature_type": "camera",
            "zone": "cbd",
            "geometry": {"type": "Point", "coordinates": [28.24, -25.746]},
            "properties": {"camera_feed_url": "rtsp://custom/camera"},
            "source_service": "test-suite",
        },
    )

    assert response.status_code == 201
    listed = client.get(
        "/api/v1/geospatial/features",
        headers=_auth_headers("viewer"),
        params={"feature_type": "camera"},
    )
    assert listed.status_code == 200
    assert "geo-camera-custom-001" in {item["feature_id"] for item in listed.json()}