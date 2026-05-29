import { useEffect, useRef } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { LiveGpsDevice } from "@/api/gpsRealtime";

interface Props {
  devices: LiveGpsDevice[];
  geoJsonLayers?: Array<{ id: string; data: unknown; color?: string }>;
  className?: string;
}

function toFeatureCollection(devices: LiveGpsDevice[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: devices.map((device) => ({
      type: "Feature",
      properties: {
        id: device.device_id,
        name: device.name,
        status: device.status,
        color: device.color,
        type: device.device_type,
      },
      geometry: {
        type: "Point",
        coordinates: [device.longitude, device.latitude],
      },
    })),
  };
}

export default function GlobalMapLibreMap({ devices, geoJsonLayers = [], className }: Props) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [20, 0],
      zoom: 1.2,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("gps-devices", {
        type: "geojson",
        data: toFeatureCollection(devices),
      });

      map.addLayer({
        id: "gps-devices-layer",
        type: "circle",
        source: "gps-devices",
        paint: {
          "circle-radius": 7,
          "circle-color": ["coalesce", ["get", "color"], "#57c7d4"],
          "circle-stroke-color": "#051019",
          "circle-stroke-width": 1.5,
        },
      });

      map.addLayer({
        id: "gps-device-labels",
        type: "symbol",
        source: "gps-devices",
        layout: {
          "text-field": ["coalesce", ["get", "name"], ["get", "id"]],
          "text-size": 11,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#f5f7fa",
          "text-halo-color": "#06121f",
          "text-halo-width": 1,
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [devices]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    const source = map.getSource("gps-devices") as maplibregl.GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(devices));

    geoJsonLayers.forEach((layer, index) => {
      const sourceId = `overlay-src-${layer.id}`;
      const fillId = `overlay-fill-${layer.id}`;
      const lineId = `overlay-line-${layer.id}`;
      const asGeoJson = layer.data as { type?: string } | null;
      const normalized = (asGeoJson && asGeoJson.type === "FeatureCollection"
        ? asGeoJson
        : asGeoJson
          ? {
              type: "FeatureCollection" as const,
              features: [{ type: "Feature" as const, geometry: asGeoJson, properties: { id: layer.id } }],
            }
          : null) as GeoJSON.FeatureCollection | null;

      if (!normalized) {
        return;
      }

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: "geojson", data: normalized as GeoJSON.FeatureCollection });
        map.addLayer({
          id: fillId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": layer.color ?? "#57c7d4",
            "fill-opacity": 0.12,
          },
        });
        map.addLayer({
          id: lineId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": layer.color ?? "#57c7d4",
            "line-width": 2,
          },
        });
      } else {
        const source = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
        source?.setData(normalized as GeoJSON.FeatureCollection);
      }

      if (index === 0 && devices.length > 0) {
        map.fitBounds(
          devices.reduce(
            (bounds, device) => bounds.extend([device.longitude, device.latitude]),
            new maplibregl.LngLatBounds([devices[0].longitude, devices[0].latitude], [devices[0].longitude, devices[0].latitude]),
          ),
          { padding: 48, maxZoom: 14, duration: 600 },
        );
      }
    });
  }, [devices, geoJsonLayers]);

  return <div ref={containerRef} className={className ?? "global-map-canvas"} aria-label="MapLibre global operations map" />;
}
