"""
================================================================================
 File: app/workers/event_consumer_runner.py
 Purpose:
   Dedicated runtime entrypoint for Kafka consumers so they can be deployed as
   standalone processes on Kubernetes or OpenStack VMs.
================================================================================
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from collections.abc import Awaitable, Callable

from app.core.logging import configure_logging
from app.services.event_consumers import consume_alerts, consume_clean_events, consume_raw_events
from orca_shared.identity import build_audit_event, bootstrap_process_identity, identity_posture

logger = logging.getLogger(__name__)

ConsumerFn = Callable[[], Awaitable[None]]


def _bootstrap_runner_identity() -> dict[str, object]:
    mode = os.getenv("EVENT_CONSUMER_MODE", "all").strip().lower() or "all"
    identity = bootstrap_process_identity(
        component_type=os.getenv("ORCA_COMPONENT_TYPE", "pod"),
        role=os.getenv("ORCA_IDENTITY_ROLE", "orca.service"),
        description=f"ORCA event consumer runner ({mode})",
        upi=os.getenv("ORCA_UPI"),
        ldap_base_dn=os.getenv("ORCA_LDAP_BASE_DN", "dc=orca,dc=internal"),
    )
    posture = identity_posture(identity)
    logger.info("worker.identity %s", json.dumps(posture, sort_keys=True))
    logger.info(
        "worker.identity.audit %s",
        json.dumps(
            build_audit_event(
                identity.upi,
                action="worker.bootstrap",
                details={
                    "role": identity.role,
                    "component_type": identity.component_type,
                    "mode": mode,
                },
            ),
            sort_keys=True,
        ),
    )
    return posture


def _selected_consumers() -> list[tuple[str, ConsumerFn]]:
    mode = os.getenv("EVENT_CONSUMER_MODE", "all").strip().lower()
    consumers: dict[str, ConsumerFn] = {
        "raw": consume_raw_events,
        "clean": consume_clean_events,
        "alerts": consume_alerts,
    }
    if mode == "all":
        return list(consumers.items())
    if mode not in consumers:
        raise ValueError("EVENT_CONSUMER_MODE must be one of: all, raw, clean, alerts")
    return [(mode, consumers[mode])]


async def _run() -> None:
    configure_logging(os.getenv("LOG_LEVEL", "INFO"))
    _bootstrap_runner_identity()
    configured = _selected_consumers()
    logger.info(
        "Starting event consumer runner with modes: %s", ", ".join(name for name, _ in configured)
    )
    await asyncio.gather(*(consumer() for _, consumer in configured))


def main() -> None:
    asyncio.run(_run())


if __name__ == "__main__":
    main()
