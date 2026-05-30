"""
================================================================================
 File: scripts/bootstrap_ldap_identity.py
 Purpose:
   Create or render the required ORCA LDAP identity tree:
     - ou=services
     - ou=devices
     - ou=agents
     - ou=processes
     - ou=roles

 Usage:
   python3 scripts/bootstrap_ldap_identity.py --ldif-output /tmp/orca-identity.ldif
   python3 scripts/bootstrap_ldap_identity.py --server ldap://localhost:389 --bind-dn cn=admin,dc=orca,dc=internal --bind-password secret --apply
================================================================================
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from orca_shared.identity import (
    DEFAULT_LDAP_BASE_DN,
    LDAPIdentityDirectory,
    build_ldap_ou_entries,
    build_role_ldap_entries,
    render_ldif,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Bootstrap the ORCA LDAP base identity tree.")
    parser.add_argument("--base-dn", default=DEFAULT_LDAP_BASE_DN)
    parser.add_argument("--ldif-output", default=None)
    parser.add_argument("--server", default=None)
    parser.add_argument("--bind-dn", default=None)
    parser.add_argument("--bind-password", default=None)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--skip-role-seed", action="store_true")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    entries = build_ldap_ou_entries(ldap_base_dn=args.base_dn)
    if not args.skip_role_seed:
        entries.extend(build_role_ldap_entries(ldap_base_dn=args.base_dn))
    ldif = render_ldif(entries)

    if args.ldif_output:
        Path(args.ldif_output).write_text(ldif, encoding="utf-8")

    if args.apply:
        if not args.server or not args.bind_dn or not args.bind_password:
            raise ValueError("--apply requires --server, --bind-dn, and --bind-password")
        directory = LDAPIdentityDirectory(
            server_uri=args.server,
            bind_dn=args.bind_dn,
            bind_password=args.bind_password,
            ldap_base_dn=args.base_dn,
        )
        created_dns = directory.ensure_base_tree(include_role_seed=not args.skip_role_seed)
        print(
            json.dumps(
                {
                    "base_dn": args.base_dn,
                    "created_dns": created_dns,
                    "ldif_output": args.ldif_output,
                    "seeded_roles": not args.skip_role_seed,
                },
                indent=2,
            )
        )
        return 0

    print(ldif, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())