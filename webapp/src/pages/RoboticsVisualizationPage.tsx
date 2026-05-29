import { useMemo, useState } from "react";

import CommandOpsLayout from "@/components/CommandOpsLayout";
import CommandCenterMap from "@/components/CommandCenterMap";
import ThreeDashboardPanel from "@/components/ThreeDashboardPanel";
import { useRealtimeCommandCenter } from "@/api/realtime";
import { useRobotFleet } from "@/api/robotGateway";
import { useSceneOverview } from "@/api/scene";
import { useRecentSensors } from "@/api/sensors";

const navItems = [
  { to: "/dashboard/drone", label: "Drone Dashboard" },
  { to: "/dashboard/robot", label: "Robot Dashboard" },
  { to: "/dashboard/city", label: "City Map Dashboard" },
  { to: "/dashboard/mission", label: "Mission Control" },
  { to: "/dashboard/individualization", label: "Individualization" },
];

export default function RoboticsVisualizationPage() {
  const [mapMode, setMapMode] = useState<"2d" | "3d" | "street">("2d");
  const sceneQuery = useSceneOverview();
  const robotQuery = useRobotFleet();
  const sensorsQuery = useRecentSensors(30);
  const realtime = useRealtimeCommandCenter("robot");

  const robots = robotQuery.data?.robots ?? [];
  const registry = robotQuery.data?.registry ?? [];
  const activeRobot = robots[0] ?? null;
  const activeRegistry = registry.find((item) => item.robot_id === activeRobot?.robot_id) ?? registry[0] ?? null;

  const mapAssets = useMemo(
    () =>
      robots.map((robot) => ({
        id: robot.robot_id,
        kind: "robot" as const,
        label: robot.robot_id,
        status: robot.status,
        subtitle: `${robot.autonomy_state} · ${Math.round(robot.battery_percent)}%`,
        latitude: robot.position.latitude,
        longitude: robot.position.longitude,
      })),
    [robots],
  );

  const logs = useMemo(() => {
    const baseLogs = sensorsQuery.data?.slice(0, 5).map((reading) => (
      `${reading.sensor_id}: ${reading.value} ${reading.unit} @ ${new Date(reading.observed_at).toLocaleTimeString()}`
    )) ?? [];

    if (activeRobot) {
      baseLogs.unshift(`${activeRobot.robot_id} slam=${activeRobot.slam_state} mode=${activeRobot.autonomy_state}`);
    }

    return baseLogs;
  }, [activeRobot, sensorsQuery.data]);

  return (
    <CommandOpsLayout
      title="Robot Dashboard"
      subtitle="RViz-grade operations view with model state, sensors, map pose, and platform telemetry"
      navItems={navItems}
      connectionStatus={realtime.connected ? "websocket live" : "degraded"}
      alertCount={0}
      statusItems={[
        { label: "ROS2 Bridge", value: realtime.connected ? "streaming" : "disconnected" },
        { label: "Robots", value: `${robots.length}` },
        { label: "Scene", value: sceneQuery.data ? "online" : "waiting" },
      ]}
      telemetry={[
        { label: "Battery", value: `${Math.round(activeRobot?.battery_percent ?? 0)}%`, tone: (activeRobot?.battery_percent ?? 0) < 20 ? "critical" : "normal" },
        { label: "CPU", value: `${activeRobot?.health_flags.includes("cpu") ? "high" : "normal"}` },
        { label: "Temperature", value: activeRobot?.health_flags.includes("temp") ? "warning" : "nominal", tone: activeRobot?.health_flags.includes("temp") ? "warn" : "normal" },
        { label: "Joint States", value: activeRobot ? "live" : "waiting" },
        { label: "Lidar", value: activeRegistry?.lidar_supported ? "point-cloud online" : "unavailable" },
        { label: "RGB/Depth", value: activeRegistry?.camera_ids.length ? "camera online" : "unavailable" },
      ]}
      logs={logs}
    >
      <div className="ops-page-grid">
        <section className="ops-panel">
          <div className="ops-panel-head">
            <h3>3D Robot Model</h3>
            <div className="ops-mode-switch">
              <button type="button" className={mapMode === "2d" ? "is-active" : ""} onClick={() => setMapMode("2d")}>2D</button>
              <button type="button" className={mapMode === "3d" ? "is-active" : ""} onClick={() => setMapMode("3d")}>3D</button>
              <button type="button" className={mapMode === "street" ? "is-active" : ""} onClick={() => setMapMode("street")}>Street</button>
            </div>
          </div>
          <ThreeDashboardPanel scene={sceneQuery.data ?? { devices: [], threats: [], camera_corridors: [], layers: [], camera_overlay_mode: "disabled", security_policy: "n/a" }} />
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head">
            <h3>Robot Pose + Sensor Zone</h3>
            <span className="ops-chip">URDF/SDF aligned</span>
          </div>
          <CommandCenterMap
            assets={mapAssets}
            threatAlerts={[]}
            zones={[]}
            selectedAssetId={activeRobot?.robot_id ?? null}
            drawPoints={[]}
            mode={mapMode}
            onMapClick={() => undefined}
            onSelectAsset={() => undefined}
            sceneOverview={sceneQuery.data ?? null}
            cameraCorridors={[]}
            geoJsonLayers={[]}
          />
        </section>
      </div>
    </CommandOpsLayout>
  );
}
