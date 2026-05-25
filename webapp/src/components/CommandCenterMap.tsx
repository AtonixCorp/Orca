import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type AssetKind = "drone" | "camera" | "sensor" | "deterrent";

interface AssetItem {
  id: string;
  kind: AssetKind;
  label: string;
  status: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}

interface ThreatAlert {
  alert_id: string;
  title: string;
  threat_level: string;
  source_ids: string[];
}

interface ZoneOverlay {
  id: string;
  label: string;
  kind: "critical" | "restricted" | "geofence";
  top: number;
  left: number;
  width: number;
  height: number;
}

interface MapPoint {
  latitude: number;
  longitude: number;
}

export default function CommandCenterMap({
  assets,
  threatAlerts,
  zones,
  selectedAssetId,
  drawPoints,
  onMapClick,
  onSelectAsset,
}: {
  assets: AssetItem[];
  threatAlerts: ThreatAlert[];
  zones: ZoneOverlay[];
  selectedAssetId: string | null;
  drawPoints: MapPoint[];
  onMapClick: (point: MapPoint) => void;
  onSelectAsset: (kind: AssetKind, id: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const overlaysRef = useRef<L.LayerGroup | null>(null);

  const bounds = useMemo(() => assets.filter((asset) => Number.isFinite(asset.latitude) && Number.isFinite(asset.longitude)), [assets]);

  function toLatLng(topPercent: number, leftPercent: number) {
    const north = -25.742;
    const south = -25.7525;
    const west = 28.226;
    const east = 28.2485;

    return {
      latitude: north - (topPercent / 100) * (north - south),
      longitude: west + (leftPercent / 100) * (east - west),
    };
  }

  useEffect(() => {
    if (import.meta.env.MODE === "test" || !mapElementRef.current || mapRef.current) {
      return;
    }

    mapRef.current = L.map(mapElementRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([-25.7479, 28.2293], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    overlaysRef.current = L.layerGroup().addTo(mapRef.current);

    mapRef.current.on("click", (event: L.LeafletMouseEvent) => {
      onMapClick({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    });
  }, []);

  useEffect(() => {
    if (!layerGroupRef.current || !mapRef.current || !overlaysRef.current) {
      return;
    }

    const group = layerGroupRef.current;
    const overlays = overlaysRef.current;
    group.clearLayers();
    overlays.clearLayers();

    zones.forEach((zone) => {
      const topLeft = toLatLng(zone.top, zone.left);
      const bottomRight = toLatLng(zone.top + zone.height, zone.left + zone.width);
      L.rectangle(
        [
          [topLeft.latitude, topLeft.longitude],
          [bottomRight.latitude, bottomRight.longitude],
        ],
        {
          color: zone.kind === "critical" ? "#f87171" : zone.kind === "restricted" ? "#f1c96b" : "#57c7d4",
          weight: 1,
          fillOpacity: 0.08,
        },
      )
        .bindTooltip(zone.label)
        .addTo(overlays);
    });

    assets.forEach((asset) => {
      const fillColor = asset.kind === "drone" ? "#8fe5db" : asset.kind === "camera" ? "#ffd776" : asset.kind === "deterrent" ? "#ffaf8d" : "#a7b9ff";
      const marker = L.circleMarker([asset.latitude, asset.longitude], {
        radius: selectedAssetId === asset.id ? 12 : 9,
        color: selectedAssetId === asset.id ? "#ffe08b" : "#041219",
        weight: 2,
        fillColor,
        fillOpacity: 0.95,
      });

      marker.bindPopup(`<strong>${asset.label}</strong><br/>${asset.subtitle}<br/>Status: ${asset.status}`);
      marker.on("click", () => onSelectAsset(asset.kind, asset.id));
      marker.addTo(group);

      if (asset.kind === "camera") {
        L.polygon(
          [
            [asset.latitude, asset.longitude],
            [asset.latitude + 0.0012, asset.longitude + 0.0018],
            [asset.latitude - 0.0006, asset.longitude + 0.0014],
          ],
          { color: "#ffd776", weight: 1, fillOpacity: 0.12 },
        ).addTo(group);
      }
    });

    threatAlerts.forEach((alert) => {
      const source = assets.find((asset) => alert.source_ids.includes(asset.id));
      if (!source) {
        return;
      }

      L.circle([source.latitude, source.longitude], {
        radius: alert.threat_level === "critical" ? 340 : 240,
        color: alert.threat_level === "critical" ? "#f87171" : "#f1c96b",
        weight: 2,
        fillOpacity: 0.12,
      }).addTo(group);
    });

    if (drawPoints.length > 1) {
      L.polyline(drawPoints.map((point) => [point.latitude, point.longitude]), {
        color: "#f1c96b",
        weight: 3,
        dashArray: "8 6",
      }).addTo(group);
    }

    if (bounds.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(bounds.map((asset) => [asset.latitude, asset.longitude])), {
        maxZoom: 15,
        padding: [36, 36],
      });
    }
  }, [assets, bounds, drawPoints, onMapClick, onSelectAsset, selectedAssetId, threatAlerts, zones]);

  return <div ref={mapElementRef} className="command-leaflet-map" aria-label="SmartCito city command map" />;
}