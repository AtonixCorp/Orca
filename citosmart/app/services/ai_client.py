"""
================================================================================
 File: app/services/ai_client.py
 Purpose:
   REST client for SmartCito AI inference services.
================================================================================
"""

from __future__ import annotations

import httpx

from app.core.config import get_settings


class AIClient:
    def __init__(self) -> None:
        self._base_url = get_settings().ai_models_url.rstrip("/")

    async def score_anomaly(self, features: list[float]) -> float:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{self._base_url}/infer", json={"features": features})
            response.raise_for_status()
            payload = response.json()
            return float(payload.get("score", 0.0))


ai_client = AIClient()