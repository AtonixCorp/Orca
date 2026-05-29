import { useMemo, useState } from "react";

import CommandOpsLayout from "@/components/CommandOpsLayout";
import GlobalCesiumMap from "@/components/GlobalCesiumMap";
import GlobalMapLibreMap from "@/components/GlobalMapLibreMap";
import { useCityMapPayload, useDroneFleet, useMappingGeofences, useMappingSearch, useThreatAlerts } from "@/api/droneGateway";
import { useGpsRealtime } from "@/api/gpsRealtime";
import { useSmartMapOverview } from "@/api/map";
import { useRealtimeCommandCenter } from "@/api/realtime";

const navItems = [
  { to: "/dashboard/drone", label: "Drone Dashboard" },
  { to: "/dashboard/robot", label: "Robot Dashboard" },
  { to: "/dashboard/city", label: "City Map Dashboard" },
  { to: "/dashboard/mission", label: "Mission Control" },
  { to: "/dashboard/individualization", label: "Individualization" },
];

const mapSources = ["local", "cloud", "osm", "satellite"] as const;
const mapImports = ["GeoJSON", "KML", "OSM XML", "TIFF", "MBTiles"];

type DrawTool = "polygon" | "geofence" | "waypoint" | "patrol" | "restricted";

export default function CityMapPage() {
  const [country, setCountry] = useState("South Africa");
  const [city, setCity] = useState("Johannesburg");
  const [missionArea, setMissionArea] = useState("Winchester");
  const [mapSource, setMapSource] = useState<(typeof mapSources)[number]>("osm");
  const [mapMode, setMapMode] = useState<"2d" | "3d" | "street">("2d");
  const [drawTool, setDrawTool] = useState<DrawTool>("polygon");

  const mapQuery = useSmartMapOverview();
  const geofenceQuery = useMappingGeofences();
  const cityMapQuery = useCityMapPayload();
  const droneFleetQuery = useDroneFleet();
  const threatQuery = useThreatAlerts();
  const searchQuery = useMappingSearch(`${city} ${missionArea}`, 6);
  const realtime = useRealtimeCommandCenter("city");
  const gpsRealtime = useGpsRealtime("city");

  const assets = useMemo(() => {
    const mapDevices = mapQuery.data?.devices ?? [];
    const drones = droneFleetQuery.data?.drones ?? [];

    const fromMap = mapDevices.map((device) => ({
      id: device.device_id,
      kind: device.device_type === "drone" ? "drone" as const : device.device_type === "robot" ? "robot" as const : device.device_type === "camera" ? "camera" as const : "sensor" as const,
      label: device.name,
      status: device.trust_level,
      subtitle: `${device.device_type} · trust ${device.trust_score}`,
      latitude: device.latitude,
      longitude: device.longitude,
    }));

    const fromDroneFleet = drones.map((drone) => ({
      id: drone.drone_id,
      kind: "drone" as const,
      label: drone.drone_id,
      status: drone.status,
      subtitle: `${drone.flight_mode} · ${Math.round(drone.battery_percent)}%`,
      latitude: drone.position.latitude,
      longitude: drone.position.longitude,
    }));

    return [...fromMap, ...fromDroneFleet];
  }, [droneFleetQuery.data?.drones, mapQuery.data?.devices]);

  const logs = [
    `Map source: ${mapSource}`,
    `Import formats ready: ${mapImports.join(", ")}`,
    `Search: ${searchQuery.data?.results[0]?.display_name ?? `${city} ${missionArea}`}`,
    `Geofences: ${geofenceQuery.data?.overlays.length ?? 0}`,
  ];

  return (
    <CommandOpsLayout
      title="City Map Dashboard"
      subtitle="Geospatial operations map with 2D/3D toggles, layers, imports, geofences, and threat overlays"
      navItems={navItems}
      connectionStatus={realtime.connected ? "websocket live" : "polling"}
      alertCount={threatQuery.data?.length ?? 0}
      statusItems={[
        { label: "Map Source", value: mapSource.toUpperCase() },
        { label: "Country", value: country },
        { label: "Mission Area", value: `${city} / ${missionArea}` },
      ]}
      telemetry={[
        { label: "Buildings", value: cityMapQuery.data?.geojson_layers?.buildings ? "loaded" : "waiting" },
        { label: "Roads", value: cityMapQuery.data?.geojson_layers?.roads ? "loaded" : "waiting" },
        { label: "Zones", value: `${geofenceQuery.data?.overlays.length ?? 0}` },
        { label: "Threats", value: `${threatQuery.data?.length ?? 0}`, tone: (threatQuery.data?.length ?? 0) > 0 ? "warn" : "normal" },
        { label: "Sensors", value: `${mapQuery.data?.devices.filter((device) => device.device_type === "sensor").length ?? 0}` },
        { label: "Assets", value: `${assets.length}` },
      ]}
      logs={logs}
    >
      <div className="ops-city-layout">
        <section className="ops-panel ops-city-controls">
          <h3>Map Selection</h3>
          <label>
            <span>Country</span>
            <input value={country} onChange={(event) => setCountry(event.target.value)} />
          </label>
          <label>
            <span>City</span>
            <input value={city} onChange={(event) => setCity(event.target.value)} />
          </label>
          <label>
            <span>Mission Area</span>
            <input value={missionArea} onChange={(event) => setMissionArea(event.target.value)} />
          </label>
          <label>
            <span>Map Source</span>
            <select value={mapSource} onChange={(event) => setMapSource(event.target.value as (typeof mapSources)[number])}>
              {mapSources.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </label>

          <h4>Map Import</h4>
          <div className="ops-chip-row">
            {mapImports.map((format) => (
              <span key={format} className="ops-chip">{format}</span>
            ))}
          </div>

          <h4>Map Tools</h4>
          <div className="ops-mode-switch">
            <button type="button" className={drawTool === "polygon" ? "is-active" : ""} onClick={() => setDrawTool("polygon")}>Polygon</button>
            <button type="button" className={drawTool === "geofence" ? "is-active" : ""} onClick={() => setDrawTool("geofence")}>Geofence</button>
            <button type="button" className={drawTool === "waypoint" ? "is-active" : ""} onClick={() => setDrawTool("waypoint")}>Waypoint</button>
            <button type="button" className={drawTool === "patrol" ? "is-active" : ""} onClick={() => setDrawTool("patrol")}>Patrol</button>
            <button type="button" className={drawTool === "restricted" ? "is-active" : ""} onClick={() => setDrawTool("restricted")}>Restricted</button>
          </div>
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head">
            <h3>Full-Screen City Visualization</h3>
            <div className="ops-mode-switch">
              <button type="button" className={mapMode === "2d" ? "is-active" : ""} onClick={() => setMapMode("2d")}>2D</button>
              <button type="button" className={mapMode === "3d" ? "is-active" : ""} onClick={() => setMapMode("3d")}>3D</button>
              <button type="button" className={mapMode === "street" ? "is-active" : ""} onClick={() => setMapMode("street")}>Street</button>
            </div>
          </div>

          {mapMode === "3d" ? (
            <GlobalCesiumMap
              devices={gpsRealtime.devices.length > 0 ? gpsRealtime.devices : assets.map((asset) => ({
                device_id: asset.id,
                channel: "city",
                device_type: asset.kind === "robot" ? "robot" : asset.kind === "drone" ? "drone" : "sensor",
                name: asset.label,
                icon: asset.kind,
                color: "#57c7d4",
                status: asset.status,
                latitude: asset.latitude,
                longitude: asset.longitude,
                altitude: 0,
                speed: 0,
                heading: 0,
                timestamp: new Date().toISOString(),
              }))}
            />
          ) : (
            <GlobalMapLibreMap
              devices={gpsRealtime.devices.length > 0 ? gpsRealtime.devices : assets.map((asset) => ({
                device_id: asset.id,
                channel: "city",
                device_type: asset.kind === "robot" ? "robot" : asset.kind === "drone" ? "drone" : "sensor",
                name: asset.label,
                icon: asset.kind,
                color: "#57c7d4",
                status: asset.status,
                latitude: asset.latitude,
                longitude: asset.longitude,
                altitude: 0,
                speed: 0,
                heading: 0,
                timestamp: new Date().toISOString(),
              }))}
              geoJsonLayers={[
                { id: "geofence", data: geofenceQuery.data?.geojson ?? null, color: "#00e0ff" },
                { id: "search", data: searchQuery.data?.geojson ?? null, color: "#7ae5be" },
                { id: "mission-routes", data: cityMapQuery.data?.geojson_layers?.mission_routes ?? null, color: "#c5d7ff" },
              ]}
            />
          )}
        </section>
      </div>
    </CommandOpsLayout>
  );
}
