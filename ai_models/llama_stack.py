from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

import httpx


def _normalize_base_url(base_url: str | None) -> str | None:
    if not base_url:
        return None
    normalized = base_url.rstrip("/")
    if not normalized.endswith("/v1"):
        normalized = f"{normalized}/v1"
    return normalized


def _extract_text(payload: dict[str, Any]) -> str:
    choices = payload.get("choices")
    if not isinstance(choices, list) or not choices:
        return ""

    first_choice = choices[0]
    if not isinstance(first_choice, dict):
        return ""

    message = first_choice.get("message")
    if isinstance(message, dict):
        content = message.get("content", "")
    else:
        content = first_choice.get("text", "")

    if isinstance(content, str):
        return content.strip()

    if isinstance(content, list):
        text_parts = [
            part.get("text", "")
            for part in content
            if isinstance(part, dict) and isinstance(part.get("text"), str)
        ]
        return "".join(text_parts).strip()

    return str(content).strip()


@dataclass(slots=True)
class LlamaStackSettings:
    base_url: str | None
    default_model: str | None
    api_key: str | None
    timeout_seconds: float

    @property
    def configured(self) -> bool:
        return bool(self.base_url and self.default_model)


def load_llama_stack_settings() -> LlamaStackSettings:
    timeout_raw = os.getenv("LLAMA_STACK_TIMEOUT_SECONDS", "30")
    try:
        timeout_seconds = float(timeout_raw)
    except ValueError:
        timeout_seconds = 30.0

    return LlamaStackSettings(
        base_url=_normalize_base_url(os.getenv("LLAMA_STACK_BASE_URL")),
        default_model=os.getenv("LLAMA_STACK_MODEL"),
        api_key=os.getenv("LLAMA_STACK_API_KEY"),
        timeout_seconds=timeout_seconds,
    )


def _build_headers(settings: LlamaStackSettings) -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if settings.api_key:
        headers["Authorization"] = f"Bearer {settings.api_key}"
    return headers


async def list_models() -> dict[str, object]:
    settings = load_llama_stack_settings()
    if not settings.configured:
        return {
            "service": "ai-models",
            "provider": "llama-stack",
            "configured": False,
            "models": [],
            "default_model": settings.default_model,
        }

    assert settings.base_url is not None
    async with httpx.AsyncClient(timeout=settings.timeout_seconds) as client:
        response = await client.get(
            f"{settings.base_url}/models",
            headers=_build_headers(settings),
        )
        response.raise_for_status()
        payload = response.json()

    items = payload.get("data", []) if isinstance(payload, dict) else []
    model_ids = [
        item.get("id")
        for item in items
        if isinstance(item, dict) and isinstance(item.get("id"), str)
    ]

    return {
        "service": "ai-models",
        "provider": "llama-stack",
        "configured": True,
        "default_model": settings.default_model,
        "models": model_ids,
    }


async def generate_text(
    prompt: str,
    *,
    system_prompt: str | None,
    model: str | None,
    temperature: float,
    max_tokens: int,
) -> dict[str, object]:
    settings = load_llama_stack_settings()
    if not settings.configured:
        raise RuntimeError(
            "LLAMA_STACK_BASE_URL and LLAMA_STACK_MODEL must be set before using /generate."
        )

    assert settings.base_url is not None
    selected_model = model or settings.default_model
    assert selected_model is not None

    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=settings.timeout_seconds) as client:
        response = await client.post(
            f"{settings.base_url}/chat/completions",
            headers=_build_headers(settings),
            json={
                "model": selected_model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        response.raise_for_status()
        payload = response.json()

    return {
        "model": selected_model,
        "provider": "llama-stack",
        "text": _extract_text(payload),
        "raw": payload,
    }