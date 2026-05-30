"""
================================================================================
 File: orcaapi/tests/test_health_identity.py
 Purpose:
   Dedicated regression coverage for the health identity posture endpoint.
================================================================================
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_identity_payload_shape() -> None:
    response = client.get("/api/v1/health/identity")

    assert response.status_code == 200
    payload = response.json()
    assert payload["upi"].startswith("orca:service:")
    assert payload["component_type"] == "service"
    assert payload["role"] == "orca.admin"
    assert payload["api_role"] == "admin"
    assert payload["ldap_dn"].startswith("uid=orca:service:")
    assert payload["ldap_dn"].endswith(",ou=services,dc=orca,dc=internal")
    assert isinstance(payload["permissions"], list)
    assert "service.health" in payload["permissions"]
    assert "process.write" in payload["permissions"]
    assert isinstance(payload["registered_at"], str)