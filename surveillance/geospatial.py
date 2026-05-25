"""
================================================================================
 File: surveillance/geospatial.py
 Purpose:
   Lightweight WGS84 location enrichment for drone, sensor, and map services.
================================================================================
"""

from __future__ import annotations

from surveillance.models import GeoPoint, MapOverlay


GEOFENCES = [
    {
        "id": "zone-1-cbd",
        "label": "CBD Operations Zone",
        "min_lat": -25.7550,
        "max_lat": -25.7420,
        "min_lon": 28.2180,
        "max_lon": 28.2360,
        "criticality": "high",
    },
    {
        "id": "zone-2-transport",
        "label": "Transport Corridor",
        "min_lat": -25.7600,
        "max_lat": -25.7350,
        "min_lon": 28.1700,
        "max_lon": 28.2050,
        "criticality": "medium",
    },
    {
        "id": "zone-3-critical-infra",
        "label": "Critical Infrastructure Area",
        "min_lat": -25.7520,
        "max_lat": -25.7380,
        "min_lon": 28.2360,
        "max_lon": 28.2600,
        "criticality": "critical",
    },
]


def resolve_zone(position: GeoPoint | None) -> dict[str, str | None]:
    if position is None:
        return {"zone_id": None, "zone_label": None, "criticality": None}

    for geofence in GEOFENCES:
        if (
            geofence["min_lat"] <= position.latitude <= geofence["max_lat"]
            and geofence["min_lon"] <= position.longitude <= geofence["max_lon"]
        ):
            return {
                "zone_id": str(geofence["id"]),
                "zone_label": str(geofence["label"]),
                "criticality": str(geofence["criticality"]),
            }

    return {"zone_id": "outside-managed-zones", "zone_label": "Outside managed zones", "criticality": "low"}


def geofence_overlays() -> list[MapOverlay]:
    overlays: list[MapOverlay] = []
    for geofence in GEOFENCES:
        center = GeoPoint(
            latitude=(float(geofence["min_lat"]) + float(geofence["max_lat"])) / 2,
            longitude=(float(geofence["min_lon"]) + float(geofence["max_lon"])) / 2,
        )
        overlays.append(
            MapOverlay(
                overlay_id=str(geofence["id"]),
                overlay_type="geofence",
                label=str(geofence["label"]),
                position=center,
                metadata={"criticality": geofence["criticality"]},
            )
        )
    return overlays


def path_around(position: GeoPoint) -> list[GeoPoint]:
    return [
        GeoPoint(latitude=position.latitude - 0.0011, longitude=position.longitude - 0.0012, altitude_m=position.altitude_m),
        GeoPoint(latitude=position.latitude - 0.0004, longitude=position.longitude - 0.0005, altitude_m=position.altitude_m),
        position,
    ]
