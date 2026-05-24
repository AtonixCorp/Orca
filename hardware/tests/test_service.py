from fastapi.testclient import TestClient

from hardware.service import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "hardware-domain"}


def test_monitoring_sample() -> None:
    response = client.get("/monitoring/sample")

    assert response.status_code == 200
    payload = response.json()
    assert payload["rack_id"] == "rack-a1"
    assert isinstance(payload["temperature_c"], float)
    assert isinstance(payload["power_kw"], float)