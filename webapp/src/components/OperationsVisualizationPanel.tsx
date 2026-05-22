import { useEffect, useMemo, useState } from "react";
import {
  fetchOperationsVisualization,
  OperationsVisualizationPayload,
  VisualizationMode,
} from "@/api/operationsVisualization";
import "./OperationsVisualizationPanel.css";

const layerDefaults = {
  map: true,
  devices: true,
  gps: true,
  traffic: true,
  threats: true,
  weather: true,
};

export default function OperationsVisualizationPanel() {
  const [mode, setMode] = useState<VisualizationMode>("2d");
  const [data, setData] = useState<OperationsVisualizationPayload | null>(null);
  const [layers, setLayers] = useState(layerDefaults);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchOperationsVisualization()
      .then((payload) => active && setData(payload))
      .catch(() => active && setData(null));

    const timer = window.setInterval(() => {
      fetchOperationsVisualization()
        .then((payload) => active && setData(payload))
        .catch(() => undefined);
    }, 10_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const selectedLabel = useMemo(() => {
    if (!selected || !data) return "Select any object on the map";
    const all = [
      ...data.devices,
      ...data.traffic,
      ...data.threats,
      ...data.weather,
      ...data.map.zones,
    ];
    return all.find((item) => item.id === selected)?.label ?? selected;
  }, [selected, data]);

  function toggleLayer(key: keyof typeof layerDefaults) {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="panel panel-wide ops-viz">
      <div className="ops-viz-header">
        <div>
          <p className="ops-viz-eyebrow">SmartCito Operations Visualization</p>
          <h3>2D + 3D GPS, Traffic, Map, Threat, Weather, and Device View</h3>
          <p className="muted">
            Unified visualization layer for operators. Switch between 2D and 3D,
            filter map layers, inspect devices, and view live operational risks.
          </p>
        </div>

        <div className="ops-viz-mode">
          <button className={mode === "2d" ? "active" : ""} onClick={() => setMode("2d")}>
            2D
          </button>
          <button className={mode === "3d" ? "active" : ""} onClick={() => setMode("3d")}>
            3D
          </button>
        </div>
      </div>

      <div className="ops-viz-layout">
        <aside className="ops-viz-sidebar">
          <strong>Visualization Layers</strong>
          <div className="ops-viz-layer-list">
            {Object.keys(layers).map((key) => (
              <button
                key={key}
                className={layers[key as keyof typeof layers] ? "active" : ""}
                onClick={() => toggleLayer(key as keyof typeof layers)}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="ops-viz-inspector">
            <strong>Inspector</strong>
            <p>{selectedLabel}</p>
            <small>
              API: <code>/api/location/dashboard/visualization</code>
            </small>
          </div>

          <div className="ops-viz-legend">
            <span><b className="legend-dot gps" /> GPS</span>
            <span><b className="legend-dot traffic" /> Traffic</span>
            <span><b className="legend-dot threat" /> Threat</span>
            <span><b className="legend-dot weather" /> Weather</span>
            <span><b className="legend-dot device" /> Device</span>
          </div>
        </aside>

        <div className={`ops-viz-map ${mode}`}>
          <div className="ops-viz-grid" />
          <div className="ops-road road-a" />
          <div className="ops-road road-b" />
          <div className="ops-road road-c" />

          {layers.map &&
            data?.map.zones.map((zone) => (
              <button
                key={zone.id}
                className={`map-zone ${zone.risk}`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                onClick={() => setSelected(zone.id)}
              >
                {zone.label}
              </button>
            ))}

          {layers.gps &&
            data?.gps_paths.map((path) =>
              path.points.map((point, index) => (
                <span
                  key={`${path.id}-${index}`}
                  className="gps-path-dot"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                />
              )),
            )}

          {layers.traffic &&
            data?.traffic.map((traffic) => (
              <button
                key={traffic.id}
                className={`traffic-heat ${traffic.level}`}
                style={{ left: `${traffic.x}%`, top: `${traffic.y}%` }}
                onClick={() => setSelected(traffic.id)}
              >
                {traffic.value}
              </button>
            ))}

          {layers.weather &&
            data?.weather.map((weather) => (
              <button
                key={weather.id}
                className={`weather-cell ${weather.type}`}
                style={{ left: `${weather.x}%`, top: `${weather.y}%` }}
                onClick={() => setSelected(weather.id)}
              >
                {weather.type}
              </button>
            ))}

          {layers.threats &&
            data?.threats.map((threat) => (
              <button
                key={threat.id}
                className={`threat-pulse ${threat.severity}`}
                style={{ left: `${threat.x}%`, top: `${threat.y}%` }}
                onClick={() => setSelected(threat.id)}
              />
            ))}

          {layers.devices &&
            data?.devices.map((device) => (
              <button
                key={device.id}
                className={`device-pin ${device.type} ${device.status}`}
                style={{ left: `${device.x}%`, top: `${device.y}%` }}
                onClick={() => setSelected(device.id)}
                title={`${device.id} · trust ${device.trust_score}%`}
              >
                <span />
                <small>{device.type}</small>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
