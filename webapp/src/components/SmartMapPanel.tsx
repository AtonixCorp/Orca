/**
 * ============================================================================
 * File: webapp/src/components/SmartMapPanel.tsx
 * Purpose:
 *   Dependency-free dashboard map for IoT -> GPS -> Map -> Camera flow.
 * ============================================================================
 */

import { useMemo, useState } from "react";

import type { SmartMapDevice } from "@/api/map";

function layerAllows(layer: string, enabledLayers: Set<string>) {
  return enabledLayers.has(layer);
}

function buildProjector(devices: SmartMapDevice[]) {
  const latitudes = devices.flatMap((device) => [
    device.latitude,
    ...device.gps_path.map(([lat]) => lat),
  ]);
  const longitudes = devices.flatMap((device) => [
    device.longitude,
    ...device.gps_path.map(([, lon]) => lon),
  ]);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latSpan = Math.max(maxLat - minLat, 0.001);
  const lonSpan = Math.max(maxLon - minLon, 0.001);

  return (latitude: number, longitude: number) => ({
    x: 8 + ((longitude - minLon) / lonSpan) * 84,
    y: 92 - ((latitude - minLat) / latSpan) * 84,
  });
}

export default function SmartMapPanel({ devices }: { devices: SmartMapDevice[] }) {
  const [enabledLayers, setEnabledLayers] = useState(
    () => new Set(["devices", "cameras", "paths", "heatmap"]),
  );

  const verifiedDevices = useMemo(
    () => devices.filter((device) => device.trust_score > 80),
    [devices],
  );

  const project = useMemo(
    () => buildProjector(verifiedDevices.length > 0 ? verifiedDevices : devices),
    [devices, verifiedDevices],
  );

  function toggleLayer(layer: string) {
    setEnabledLayers((current) => {
      const next = new Set(current);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }

  return (
    <article className="panel panel-wide smart-map-panel">
      <header className="panel-header map-panel-header">
        <div>
          <h3>SmartCito Map</h3>
          <p className="muted">
            Verified devices only · GPS paths · camera overlays · sensor heatmap
          </p>
        </div>
      </header>

      <div className="map-layout">
        <div className="smart-map css-smart-map" aria-label="SmartCito verified device map">
          <div className="scene-grid" />
          <div className="scene-line line-a" />
          <div className="scene-line line-b" />
          <div className="scene-line line-c" />

          {layerAllows("paths", enabledLayers) && (
            <svg className="css-map-paths" viewBox="0 0 100 100" preserveAspectRatio="none">
              {verifiedDevices.map((device) => {
                if (device.gps_path.length < 2) return null;
                const points = device.gps_path
                  .map(([lat, lon]) => {
                    const point = project(lat, lon);
                    return `${point.x},${point.y}`;
                  })
                  .join(" ");

                return (
                  <polyline
                    key={`${device.id}-path`}
                    points={points}
                    fill="none"
                    stroke="#57c7d4"
                    strokeWidth="0.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                );
              })}
            </svg>
          )}

          {verifiedDevices.map((device) => {
            const point = project(device.latitude, device.longitude);
            const hasCamera = Boolean(device.camera_feed_url);

            if (device.device_type === "camera" && !layerAllows("cameras", enabledLayers)) {
              return null;
            }

            return (
              <div key={device.id}>
                {layerAllows("heatmap", enabledLayers) && (
                  <span
                    className="css-map-heat"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      width: `${56 + (device.sensor_value ?? 0.5) * 60}px`,
                      height: `${56 + (device.sensor_value ?? 0.5) * 60}px`,
                    }}
                  />
                )}

                {layerAllows("devices", enabledLayers) && (
                  <button
                    className={`smart-map-pin css-map-pin ${device.device_type}`}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    title={`${device.name} · trust ${device.trust_score}`}
                  >
                    <span>{device.device_type.toUpperCase()}</span>
                  </button>
                )}

                {hasCamera && layerAllows("cameras", enabledLayers) && (
                  <span
                    className="css-camera-badge"
                    style={{ left: `${point.x}%`, top: `${point.y + 6}%` }}
                  >
                    CAM
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <aside className="map-sidebar">
          <div className="map-layer-controls" aria-label="Map layer controls">
            {[
              ["devices", "Device pins"],
              ["cameras", "Camera overlays"],
              ["paths", "GPS paths"],
              ["heatmap", "Sensor heatmap"],
            ].map(([layer, label]) => (
              <label key={layer}>
                <input
                  type="checkbox"
                  checked={enabledLayers.has(layer)}
                  onChange={() => toggleLayer(layer)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="map-device-list">
            {verifiedDevices.map((device) => (
              <div className="map-device-card" key={device.id}>
                <strong>{device.name}</strong>
                <span>{device.device_type} · trust {device.trust_score}</span>
                <span>{device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </article>
  );
}