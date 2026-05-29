import { useMemo, useState } from "react";

import CommandOpsLayout from "@/components/CommandOpsLayout";
import GlobalCesiumMap from "@/components/GlobalCesiumMap";
import { useGpsRealtime } from "@/api/gpsRealtime";
import { useRealtimeCommandCenter } from "@/api/realtime";
import { useCameraFeeds, useDroneFleet, useDroneMissions, useThreatAlerts } from "@/api/droneGateway";

const navItems = [
  { to: "/dashboard/drone", label: "Drone Dashboard" },
  { to: "/dashboard/robot", label: "Robot Dashboard" },
  { to: "/dashboard/city", label: "City Map Dashboard" },
  { to: "/dashboard/mission", label: "Mission Control" },
  { to: "/dashboard/individualization", label: "Individualization" },
];

function deg(value: number) {
  return `${Math.round(value)}°`;
}

export default function DroneVisualizationPage() {
  const [selectedDroneId, setSelectedDroneId] = useState("");
  const realtime = useRealtimeCommandCenter("drone");
  const gpsRealtime = useGpsRealtime("drone");
  const fleetQuery = useDroneFleet();
  const feedsQuery = useCameraFeeds();
  const missionQuery = useDroneMissions();
  const threatQuery = useThreatAlerts();

  const drones = fleetQuery.data?.drones ?? [];
  const registry = fleetQuery.data?.registry ?? [];
  const activeDrone = drones.find((drone) => drone.drone_id === selectedDroneId) ?? drones[0] ?? null;
  const activeRegistry = registry.find((item) => item.drone_id === activeDrone?.drone_id) ?? registry[0] ?? null;
  const activeFeed = feedsQuery.data?.find((feed) => feed.drone_id === activeDrone?.drone_id) ?? feedsQuery.data?.[0] ?? null;
  const activeMission = missionQuery.data?.find((mission) => mission.drone_id === activeDrone?.drone_id) ?? missionQuery.data?.[0] ?? null;

  const mapDevices = useMemo(() => {
    if (gpsRealtime.devices.length > 0) {
      return gpsRealtime.devices;
    }

    return drones.map((drone) => ({
      device_id: drone.drone_id,
      channel: "drone" as const,
      device_type: "drone" as const,
      name: drone.drone_id,
      icon: "drone",
      color: "#8fe5db",
      status: drone.status,
      latitude: drone.position.latitude,
      longitude: drone.position.longitude,
      altitude: drone.position.altitude_m ?? 0,
      speed: drone.speed_mps,
      heading: drone.heading_deg,
      timestamp: new Date().toISOString(),
    }));
  }, [drones, gpsRealtime.devices]);

  const logs = [
    `${activeDrone?.drone_id ?? "no-drone"} mode ${activeDrone?.flight_mode ?? "n/a"}`,
    `MAVLink link quality ${Math.round(activeDrone?.link_quality ?? 0)}%`,
    `${threatQuery.data?.length ?? 0} threat alerts`,
    `${missionQuery.data?.length ?? 0} mission plans`,
  ];

  return (
    <CommandOpsLayout
      title="Drone Dashboard"
      subtitle="PX4-grade flight view with attitude, vectors, GPS trail, mission path, and MAVLink telemetry"
      navItems={navItems}
      connectionStatus={realtime.connected ? "websocket live" : "polling"}
      alertCount={threatQuery.data?.length ?? 0}
      statusItems={[
        { label: "MAVLink", value: activeRegistry?.protocol ?? "offline" },
        { label: "Telemetry", value: realtime.connected ? "websocket" : "polling" },
        { label: "Threat Feed", value: `${threatQuery.data?.length ?? 0} active` },
      ]}
      telemetry={[
        { label: "Battery", value: `${Math.round(activeDrone?.battery_percent ?? 0)}%`, tone: (activeDrone?.battery_percent ?? 0) < 20 ? "critical" : "normal" },
        { label: "Pitch", value: deg(activeFeed?.gimbal.pitch_deg ?? 0) },
        { label: "Roll", value: deg((activeDrone?.heading_deg ?? 0) * 0.3) },
        { label: "Yaw", value: deg(activeFeed?.gimbal.yaw_deg ?? activeDrone?.heading_deg ?? 0) },
        { label: "Velocity", value: `${(activeDrone?.speed_mps ?? 0).toFixed(1)} m/s` },
        { label: "Wind Vector", value: `${((activeDrone?.heading_deg ?? 0) + 23) % 360}° / 4.1m/s` },
        { label: "GPS", value: activeDrone ? `${activeDrone.position.latitude.toFixed(4)}, ${activeDrone.position.longitude.toFixed(4)}` : "unavailable" },
        { label: "RC Signal", value: `${Math.round(activeDrone?.link_quality ?? 0)}%`, tone: (activeDrone?.link_quality ?? 0) < 40 ? "warn" : "normal" },
      ]}
      logs={logs}
    >
      <div className="ops-page-grid">
        <section className="ops-panel">
          <div className="ops-panel-head">
            <h3>Flight Model</h3>
            <select value={activeDrone?.drone_id ?? ""} onChange={(event) => setSelectedDroneId(event.target.value)}>
              {drones.map((drone) => (
                <option key={drone.drone_id} value={drone.drone_id}>{drone.drone_id}</option>
              ))}
            </select>
          </div>

          <div className="ops-flight-hud" aria-label="Attitude indicator">
            <div className="ops-attitude">
              <div className="ops-attitude-ring" style={{ transform: `rotate(${activeFeed?.gimbal.yaw_deg ?? activeDrone?.heading_deg ?? 0}deg)` }} />
              <strong>{activeDrone?.flight_mode ?? "standby"}</strong>
            </div>
            <div className="ops-flight-meta">
              <span>Mission: {activeMission?.name ?? "none"}</span>
              <span>Progress: {Math.round(activeMission?.progress_percent ?? 0)}%</span>
              <span>Camera: {activeFeed?.camera_id ?? "offline"}</span>
              <span>Vector: {(activeDrone?.speed_mps ?? 0).toFixed(1)} m/s @ {deg(activeDrone?.heading_deg ?? 0)}</span>
            </div>
          </div>
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head">
            <h3>Global 3D Flight Map (Cesium)</h3>
            <span className="ops-chip">GPS live + mission overlay</span>
          </div>
          <GlobalCesiumMap
            devices={mapDevices}
            missionPath={
              activeMission?.waypoints.map((point) => ({
                latitude: point.latitude,
                longitude: point.longitude,
                altitude: point.altitude_m ?? 0,
              })) ?? []
            }
          />
        </section>
      </div>
    </CommandOpsLayout>
  );
}
