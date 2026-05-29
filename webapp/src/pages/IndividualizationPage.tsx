import { useMemo, useState } from "react";

import CommandOpsLayout from "@/components/CommandOpsLayout";
import { useDroneFleet } from "@/api/droneGateway";
import { useRealtimeCommandCenter } from "@/api/realtime";
import { useRobotFleet } from "@/api/robotGateway";

const navItems = [
  { to: "/dashboard/drone", label: "Drone Dashboard" },
  { to: "/dashboard/robot", label: "Robot Dashboard" },
  { to: "/dashboard/city", label: "City Map Dashboard" },
  { to: "/dashboard/mission", label: "Mission Control" },
  { to: "/dashboard/individualization", label: "Individualization" },
];

export default function IndividualizationPage() {
  const droneFleetQuery = useDroneFleet();
  const robotFleetQuery = useRobotFleet();
  const realtime = useRealtimeCommandCenter("individualization");

  const droneRegistry = droneFleetQuery.data?.registry ?? [];
  const robotRegistry = robotFleetQuery.data?.registry ?? [];

  const [assetType, setAssetType] = useState<"drone" | "robot">("drone");
  const [assetId, setAssetId] = useState("");

  const currentDrone = useMemo(
    () => droneRegistry.find((item) => item.drone_id === assetId) ?? droneRegistry[0] ?? null,
    [assetId, droneRegistry],
  );
  const currentRobot = useMemo(
    () => robotRegistry.find((item) => item.robot_id === assetId) ?? robotRegistry[0] ?? null,
    [assetId, robotRegistry],
  );
  const currentAsset = assetType === "drone" ? currentDrone : currentRobot;

  const capabilities = useMemo(() => {
    if (!currentAsset) {
      return [] as string[];
    }

    if (assetType === "drone" && currentDrone) {
      return [
        `Max speed: ${currentDrone.max_speed_mps} m/s`,
        `Max altitude: ${currentDrone.max_altitude_m} m`,
        `Payload support: ${currentDrone.payload_supported ? "yes" : "no"}`,
      ];
    }

    if (!currentRobot) {
      return [] as string[];
    }

    return [
      `Max speed: ${currentRobot.max_speed_mps} m/s`,
      `Lidar: ${currentRobot.lidar_supported ? "installed" : "none"}`,
      `Autonomy modes: ${currentRobot.autonomy_modes.join(", ")}`,
    ];
  }, [assetType, currentDrone, currentRobot]);

  const serialValue = assetType === "drone"
    ? (currentDrone ? `drone-${currentDrone.drone_id}` : "unassigned")
    : (currentRobot ? `robot-${currentRobot.robot_id}` : "unassigned");

  const identityValue = assetType === "drone" ? currentDrone?.drone_id : currentRobot?.robot_id;

  const profileOptions = assetType === "drone"
    ? droneRegistry.map((item) => ({ id: item.drone_id, label: item.drone_id }))
    : robotRegistry.map((item) => ({ id: item.robot_id, label: item.robot_id }));

  return (
    <CommandOpsLayout
      title="Individualization"
      subtitle="PX4 / ROS profile setup for platform identity, firmware, hardware capability, sensors, calibration, and modules"
      navItems={navItems}
      connectionStatus={realtime.connected ? "websocket live" : "polling"}
      alertCount={0}
      statusItems={[
        { label: "Asset Type", value: assetType.toUpperCase() },
        { label: "Profiles", value: `${droneRegistry.length + robotRegistry.length}` },
        { label: "Selection", value: currentAsset ? "loaded" : "none" },
      ]}
      telemetry={[
        { label: "Firmware", value: currentAsset?.firmware_version ?? "unknown" },
        { label: "Serial", value: serialValue },
        { label: "Calibration", value: "verified" },
        { label: "AI Modules", value: "vision, tracking, anomaly" },
        { label: "Status", value: currentAsset?.status ?? "offline", tone: currentAsset?.status === "offline" ? "critical" : currentAsset?.status === "degraded" ? "warn" : "normal" },
      ]}
      logs={[
        `Loaded ${assetType} profile`,
        `Sensor list size ${currentAsset?.sensors.length ?? 0}`,
        `Hardware profile ${currentAsset ? "available" : "not available"}`,
      ]}
    >
      <div className="ops-individualization-layout">
        <section className="ops-panel ops-form-stack">
          <h3>Identity Setup</h3>
          <label>
            <span>Asset Type</span>
            <select value={assetType} onChange={(event) => { setAssetType(event.target.value as "drone" | "robot"); setAssetId(""); }}>
              <option value="drone">Drone</option>
              <option value="robot">Robot</option>
            </select>
          </label>

          <label>
            <span>Asset Profile</span>
            <select value={assetId} onChange={(event) => setAssetId(event.target.value)}>
              <option value="">Select profile</option>
              {profileOptions.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="ops-panel">
          <h3>Platform Profile</h3>
          <div className="ops-profile-grid">
            <div>
              <span>Identity</span>
              <strong>{identityValue ?? "unknown"}</strong>
            </div>
            <div>
              <span>Model</span>
              <strong>{currentAsset?.model ?? "unknown"}</strong>
            </div>
            <div>
              <span>Firmware Version</span>
              <strong>{currentAsset?.firmware_version ?? "unknown"}</strong>
            </div>
            <div>
              <span>Battery Capacity</span>
              <strong>{currentAsset?.battery_capacity_mah ?? 0} mAh</strong>
            </div>
            <div>
              <span>Protocol</span>
              <strong>{currentAsset?.protocol ?? "unknown"}</strong>
            </div>
            <div>
              <span>Last Seen</span>
              <strong>{currentAsset?.last_seen_at ? new Date(currentAsset.last_seen_at).toLocaleString() : "never"}</strong>
            </div>
          </div>

          <h4>Hardware Capabilities</h4>
          <div className="ops-chip-row">
            {capabilities.map((value) => (
              <span key={value} className="ops-chip">{value}</span>
            ))}
          </div>

          <h4>Sensors Installed</h4>
          <div className="ops-chip-row">
            {currentAsset?.sensors.map((sensor) => <span key={sensor} className="ops-chip">{sensor}</span>)}
          </div>
        </section>
      </div>
    </CommandOpsLayout>
  );
}
