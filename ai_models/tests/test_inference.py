from fastapi.testclient import TestClient

from ai_models.inference import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "ai-models"}


def test_infer_returns_bounded_score() -> None:
    response = client.post("/infer", json={"features": [0.1, -0.8, 2.5]})

    assert response.status_code == 200
    assert response.json()["score"] == 1.0