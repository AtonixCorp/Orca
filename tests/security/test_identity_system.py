from uuid import UUID

from orca_shared.identity import (
    DEFAULT_LDAP_BASE_DN,
    DEFAULT_ROLE_PERMISSIONS,
    ROLE_ORCA_ADMIN,
    ROLE_ORCA_DEVICE,
    ROLE_ORCA_SERVICE,
    ROLE_ORCA_OPERATOR,
    ROLE_ORCA_VIEWER,
    InMemoryIdentityDirectory,
    LDAPIdentityDirectory,
    bootstrap_process_identity,
    build_audit_event,
    build_ldap_entry,
    build_ldap_ou_entries,
    build_role_ldap_entries,
    build_upi_dn,
    generate_upi,
    identity_posture,
    identity_role_to_api_role,
    is_valid_upi,
    render_ldif,
    role_has_permission,
)


class _FakeLDAPEntry:
    def __init__(self, attributes: dict[str, object]) -> None:
        self.entry_attributes_as_dict = attributes


class _FakeLDAPConnection:
    def __init__(self, directory: dict[str, dict[str, object]]) -> None:
        self.directory = directory
        self.entries: list[_FakeLDAPEntry] = []
        self.result = {"description": "success"}

    def search(self, search_base: str, search_filter: str, search_scope: object, attributes: list[str]) -> bool:
        _ = (search_filter, search_scope, attributes)
        payload = self.directory.get(search_base)
        self.entries = [] if payload is None else [_FakeLDAPEntry(payload)]
        return payload is not None

    def add(self, dn: str, object_classes: list[str], attributes: dict[str, object]) -> bool:
        _ = object_classes
        self.directory[dn] = dict(attributes)
        return True

    def modify(self, dn: str, changes: dict[str, list[tuple[object, list[str]]]]) -> bool:
        if dn not in self.directory:
            self.result = {"description": "noSuchObject"}
            return False
        for attribute, operations in changes.items():
            _, values = operations[0]
            self.directory[dn][attribute] = list(values)
        return True

    def unbind(self) -> None:
        return None


class _FakeLDAPModule:
    NONE = object()
    BASE = object()
    MODIFY_REPLACE = object()

    def __init__(self, directory: dict[str, dict[str, object]]) -> None:
        self._directory = directory

    def Server(self, server_uri: str, get_info: object) -> tuple[str, object]:
        return (server_uri, get_info)

    def Connection(self, server: object, user: str, password: str, auto_bind: bool) -> _FakeLDAPConnection:
        _ = (server, user, password, auto_bind)
        return _FakeLDAPConnection(self._directory)


def test_generate_upi_uses_required_format() -> None:
    upi = generate_upi("service")

    assert upi.startswith("orca:service:")
    assert is_valid_upi(upi) is True
    UUID(upi.rsplit(":", 1)[1])


def test_build_upi_dn_routes_to_expected_ldap_ou() -> None:
    upi = "orca:drone:550e8400-e29b-41d4-a716-446655440000"

    dn = build_upi_dn(upi)

    assert dn == f"uid={upi},ou=devices,{DEFAULT_LDAP_BASE_DN}"


def test_build_ldap_entry_contains_role_and_description() -> None:
    upi = "orca:service:550e8400-e29b-41d4-a716-446655440000"

    entry = build_ldap_entry(upi, description="ORCA Gateway Service", role=ROLE_ORCA_ADMIN)

    assert entry.attributes["uid"] == upi
    assert entry.attributes["description"] == "ORCA Gateway Service"
    assert entry.attributes["orcaRole"] == ROLE_ORCA_ADMIN


def test_role_permissions_cover_required_actions() -> None:
    assert role_has_permission(ROLE_ORCA_ADMIN, "service.stop") is True
    assert role_has_permission(ROLE_ORCA_OPERATOR, "telemetry.write") is True
    assert role_has_permission(ROLE_ORCA_DEVICE, "device.register") is True
    assert role_has_permission(ROLE_ORCA_VIEWER, "telemetry.write") is False
    assert "process.read" in DEFAULT_ROLE_PERMISSIONS[ROLE_ORCA_VIEWER]


def test_bootstrap_process_identity_registers_identity_locally() -> None:
    directory = InMemoryIdentityDirectory()

    identity = bootstrap_process_identity(
        component_type="service",
        role=ROLE_ORCA_ADMIN,
        description="ORCA API service",
        directory=directory,
    )

    assert directory.authenticate(identity.upi) is True
    assert directory.authorize(identity.upi, "service.health") is True
    assert identity.dn.startswith("uid=orca:service:")


def test_identity_role_to_api_role_bridges_orca_roles() -> None:
    assert identity_role_to_api_role(ROLE_ORCA_ADMIN) == "admin"
    assert identity_role_to_api_role(ROLE_ORCA_OPERATOR) == "operator"
    assert identity_role_to_api_role(ROLE_ORCA_VIEWER) == "viewer"


def test_build_audit_event_records_identity_and_action() -> None:
    event = build_audit_event(
        "orca:service:550e8400-e29b-41d4-a716-446655440000",
        action="process.bootstrap",
        details={"role": ROLE_ORCA_ADMIN},
    )

    assert event["identity"].startswith("orca:service:")
    assert event["action"] == "process.bootstrap"
    assert event["details"]["role"] == ROLE_ORCA_ADMIN


def test_build_ldap_ou_entries_covers_required_tree() -> None:
    entries = build_ldap_ou_entries()

    dns = {entry.dn for entry in entries}
    assert f"ou=services,{DEFAULT_LDAP_BASE_DN}" in dns
    assert f"ou=devices,{DEFAULT_LDAP_BASE_DN}" in dns
    assert f"ou=agents,{DEFAULT_LDAP_BASE_DN}" in dns
    assert f"ou=processes,{DEFAULT_LDAP_BASE_DN}" in dns
    assert f"ou=roles,{DEFAULT_LDAP_BASE_DN}" in dns


def test_render_ldif_outputs_organizational_units() -> None:
    ldif = render_ldif(build_ldap_ou_entries())

    assert "dn: ou=services,dc=orca,dc=internal" in ldif
    assert "objectClass: organizationalUnit" in ldif


def test_identity_posture_reports_permissions() -> None:
    identity = bootstrap_process_identity(
        component_type="agent",
        role="orca.agent",
        description="Hardware agent",
        directory=InMemoryIdentityDirectory(),
    )

    posture = identity_posture(identity)

    assert posture["upi"].startswith("orca:agent:")
    assert posture["role"] == "orca.agent"
    assert "process.write" in posture["permissions"]


def test_build_role_ldap_entries_seeds_required_role_permissions() -> None:
    entries = build_role_ldap_entries()

    dns = {entry.dn for entry in entries}
    assert f"cn=orca.admin,ou=roles,{DEFAULT_LDAP_BASE_DN}" in dns
    assert f"cn=orca.viewer,ou=roles,{DEFAULT_LDAP_BASE_DN}" in dns

    admin_entry = next(entry for entry in entries if entry.attributes["cn"] == "orca.admin")
    viewer_entry = next(entry for entry in entries if entry.attributes["cn"] == "orca.viewer")

    assert "telemetry.write" in admin_entry.attributes["orcaPermission"]
    assert "telemetry.write" not in viewer_entry.attributes["orcaPermission"]


def test_live_ldap_lookup_and_role_verification(monkeypatch) -> None:
    upi = "orca:service:550e8400-e29b-41d4-a716-446655440000"
    directory_data = {
        f"uid={upi},ou=services,{DEFAULT_LDAP_BASE_DN}": {
            "uid": [upi],
            "orcaRole": [ROLE_ORCA_SERVICE],
            "description": ["ORCA event consumer"],
        },
        f"cn={ROLE_ORCA_SERVICE},ou=roles,{DEFAULT_LDAP_BASE_DN}": {
            "cn": [ROLE_ORCA_SERVICE],
            "orcaPermission": ["service.health", "process.write"],
        },
    }
    fake_ldap = _FakeLDAPModule(directory_data)
    monkeypatch.setattr("orca_shared.identity._optional_import_ldap3", lambda: fake_ldap)

    directory = LDAPIdentityDirectory(
        server_uri="ldap://example",
        bind_dn="cn=admin,dc=orca,dc=internal",
        bind_password="secret",
    )

    identity = directory.lookup_identity(upi)

    assert identity is not None
    assert identity.upi == upi
    assert identity.role == ROLE_ORCA_SERVICE
    assert directory.verify_role_assignment(upi, expected_role=ROLE_ORCA_SERVICE) is True
    assert directory.verify_role_assignment(upi, permission="process.write") is True
    assert directory.verify_role_assignment(upi, permission="service.stop") is False


def test_live_ldap_role_update_rewrites_directory_assignment(monkeypatch) -> None:
    upi = "orca:service:550e8400-e29b-41d4-a716-446655440000"
    directory_data = {
        f"uid={upi},ou=services,{DEFAULT_LDAP_BASE_DN}": {
            "uid": [upi],
            "orcaRole": [ROLE_ORCA_SERVICE],
            "description": ["ORCA gateway"],
        },
        f"cn={ROLE_ORCA_SERVICE},ou=roles,{DEFAULT_LDAP_BASE_DN}": {
            "cn": [ROLE_ORCA_SERVICE],
            "orcaPermission": ["service.health"],
        },
        f"cn={ROLE_ORCA_ADMIN},ou=roles,{DEFAULT_LDAP_BASE_DN}": {
            "cn": [ROLE_ORCA_ADMIN],
            "orcaPermission": ["service.health", "service.stop", "telemetry.write"],
        },
    }
    fake_ldap = _FakeLDAPModule(directory_data)
    monkeypatch.setattr("orca_shared.identity._optional_import_ldap3", lambda: fake_ldap)

    directory = LDAPIdentityDirectory(
        server_uri="ldap://example",
        bind_dn="cn=admin,dc=orca,dc=internal",
        bind_password="secret",
    )

    updated = directory.update_role_assignment(upi, ROLE_ORCA_ADMIN)

    assert updated.role == ROLE_ORCA_ADMIN
    assert directory.verify_role_assignment(upi, expected_role=ROLE_ORCA_ADMIN) is True
    assert directory.verify_role_assignment(upi, permission="telemetry.write") is True