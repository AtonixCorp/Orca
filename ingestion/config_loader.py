"""
================================================================================
 File: ingestion/config_loader.py
 Purpose:
   Shared YAML-backed topic configuration loader for ingestion producers.
================================================================================
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import yaml


@lru_cache(maxsize=1)
def load_topics() -> dict[str, str]:
    config_path = Path(__file__).resolve().parent / "config" / "topics.yml"
    payload = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    topics = payload.get("topics", {})
    if not isinstance(topics, dict):
        raise ValueError("ingestion/config/topics.yml must contain a 'topics' mapping")
    return {str(key): str(value) for key, value in topics.items()}