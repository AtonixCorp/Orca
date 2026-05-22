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

type VisualizationTopic = "map" | "gps" | "traffic" | "threat" | "weather" | "device";

const topics: Array<{ key: VisualizationTopic; label: string; description: string }> = [
  { key: "map", label: "Map", description: "City zones, roads, regions, and risk areas." },
  { key: "gps", label: "GPS", description: "GPS paths, live coordinates, and movement history." },
  { key: "traffic", label: "Traffic", description: "Congestion, road flow, and traffic intensity." },
  { key: "threat", label: "Threat", description: "AI alerts, suspicious activity, and threat waves." },
  { key: "weather", label: "Weather", description: "Rain, wind, heat, and environmental overlays." },
  { key: "device", label: "Device", description: "IoT, cameras, Raspberry Pi, GPS nodes, and trust scores." },
];

export default function OperationsVisualizationPanel() {
  const [mode, setMode] = useState<VisualizationMode>("2d");
  const [topic, setTopic] = useState<VisualizationTopic>("map");
  const [data, setData] = useState<OperationsVisualizationPayload | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const activeTopic = topics.find((item) => item.key === topic) ?? topics[0];

  const selectedLabel = useMemo(() => {
    if (!selected || !data) return `Open a ${activeTopic.label} object to inspect it`;
    const all = [
      ...data.devices,
      ...data.traffic,
      ...data.threats,
      ...data.weather,
      ...data.map.zones,
    ];
    return all.find((item) => item.id === selected)?.label ?? selected;
  }, [selected, data, activeTopic.label]);

  function toggleLayer(key: keyof typeof layerDefaults) {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="panel panel-wide ops-viz">
      <div className="ops-viz-header">
        <div>
          <p className="ops-viz-eyebrow">SmartCito Operations Visualization</p>
          <h3>{activeTopic.label} Visualization</h3>
          <p className="muted">{activeTopic.description}</p>
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

      <div className="ops-topic-tabs">
        {topics.map((item) => (
          <button
            key={item.key}
            className={topic === item.key ? "active" : ""}
            onClick={() => {
              setTopic(item.key);
              setSelected(null);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={`ops-viz-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <aside className="ops-viz-sidebar">
          <button
            className="ops-sidebar-toggle"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={sidebarCollapsed ? "Expand visualization sidebar" : "Collapse visualization sidebar"}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>

          {!sidebarCollapsed && (
            <>
              <strong>{activeTopic.label} Inspector</strong>

              <div className="ops-viz-inspector">
                <p>{selectedLabel}</p>
                <small>
                  Topic: <code>{topic}</code>
                </small>
              </div>

              <div className="ops-viz-legend">
                {topic === "map" && <span><b className="legend-dot map" /> Map zones</span>}
                {topic === "gps" && <span><b className="legend-dot gps" /> GPS path</span>}
                {topic === "traffic" && <span><b className="legend-dot traffic" /> Traffic heat</span>}
                {topic === "threat" && <span><b className="legend-dot threat" /> Threat pulse</span>}
                {topic === "weather" && <span><b className="legend-dot weather" /> Weather cell</span>}
                {topic === "device" && <span><b className="legend-dot device" /> Device pin</span>}
              </div>
            </>
          )}
        </aside>

        <div className={`ops-viz-map ${mode} topic-${topic}`}>
          <div className="ops-viz-grid" />
          <div className="ops-road road-a" />
          <div className="ops-road road-b" />
          <div className="ops-road road-c" />

          {topic === "map" &&
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

          {topic === "gps" &&
            data?.gps_paths.map((path) =>
              path.points.map((point, index) => (
                <span
                  key={`${path.id}-${index}`}
                  className="gps-path-dot"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                />
              )),
            )}

          {topic === "traffic" &&
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

          {topic === "weather" &&
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

          {topic === "threat" &&
            data?.threats.map((threat) => (
              <button
                key={threat.id}
                className={`threat-pulse ${threat.severity}`}
                style={{ left: `${threat.x}%`, top: `${threat.y}%` }}
                onClick={() => setSelected(threat.id)}
                title={threat.label}
              />
            ))}

          {topic === "device" &&
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
