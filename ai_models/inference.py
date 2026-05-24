"""
================================================================================
 File: ai_models/inference.py
 Purpose:
   Minimal FastAPI inference service for SmartCito AI contributors.
================================================================================
"""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from ai_models.model import score_anomaly


load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

app = FastAPI(title="SmartCito AI Models")


class InferenceRequest(BaseModel):
    """Request payload for simple anomaly scoring."""

    features: list[float] = Field(default_factory=list)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-models"}


@app.post("/infer")
async def infer(request: InferenceRequest) -> dict[str, float]:
    return {"score": score_anomaly(request.features)}
