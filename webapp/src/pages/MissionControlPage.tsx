import { useMemo, useState } from "react";

import CommandOpsLayout from "@/components/CommandOpsLayout";
import CommandCenterMap from "@/components/CommandCenterMap";
import { useCityMissions, useCreateCityMission } from "@/api/missionControl";
import { useDroneFleet } from "@/api/droneGateway";
import { useRobotFleet } from "@/api/robotGateway";
import { useRealtimeCommandCenter } from "@/api/realtime";

const navItems = [
  { to: "/dashboard/drone", label: "Drone Dashboard" },
  { to: "/dashboard/robot", label: "Robot Dashboard" },
  { to: "/dashboard/city", label: "City Map Dashboard" },
  { to: "/dashboard/mission", label: "Mission Control" },
  { to: "/dashboard/individualization", label: "Individualization" },
];

const missionTypes = ["Patrol", "Surveillance", "Delivery", "Mapping", "Perimeter scan"];
const missionActions = ["hover", "take_photo", "scan_area", "continue"];

interface MissionPoint {
  latitude: number;
  longitude: number;
  altitude_m: number;
  speed_mps: number;
  action: string;
}

function validateMission(points: MissionPoint[]) {
  if (points.length < 2) {
    return "Add at least two waypoints.";
  }

  if (points.some((point) => Number.isNaN(point.latitude) || Number.isNaN(point.longitude))) {
    return "Waypoint latitude/longitude must be valid numbers.";
  }

  if (points.some((point) => point.altitude_m <= 0 || point.speed_mps <= 0)) {
    return "Altitude and speed must be greater than zero.";
  }

  return "Mission validated";
}

export default function MissionControlPage() {
  const cityMissionsQuery = useCityMissions();
  const createMission = useCreateCityMission();
  const droneFleetQuery = useDroneFleet();
  const robotFleetQuery = useRobotFleet();
  const realtime = useRealtimeCommandCenter("mission");

  const drones = droneFleetQuery.data?.registry ?? [];
  const robots = robotFleetQuery.data?.registry ?? [];

  const [missionName, setMissionName] = useState("Urban Sweep Alpha");
  const [missionType, setMissionType] = useState(missionTypes[0]);
  const [city, setCity] = useState("Johannesburg");
  const [district, setDistrict] = useState("Winchester");
  const [selectedDroneId, setSelectedDroneId] = useState("");
  const [selectedRobotId, setSelectedRobotId] = useState("");
  const [points, setPoints] = useState<MissionPoint[]>([]);
  const [importBlob, setImportBlob] = useState("");

  const validationMessage = validateMission(points);

  const timeline = useMemo(() => {
    return points.map((point, index) => ({
      label: `WP${index + 1}`,
      detail: `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)} @ ${point.altitude_m}m / ${point.speed_mps}mps · ${point.action}`,
    }));
  }, [points]);

  function addWaypoint() {
    setPoints((current) => [
      ...current,
      {
        latitude: -25.7479 + current.length * 0.0008,
        longitude: 28.2293 + current.length * 0.0008,
        altitude_m: 90,
        speed_mps: 8,
        action: missionActions[0],
      },
    ]);
  }

  function updateWaypoint(index: number, patch: Partial<MissionPoint>) {
    setPoints((current) => current.map((point, currentIndex) => (currentIndex === index ? { ...point, ...patch } : point)));
  }

  function exportMission() {
    const payload = {
      missionName,
      missionType,
      city,
      district,
      selectedDroneId,
      selectedRobotId,
      points,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${missionName.replace(/\s+/g, "-").toLowerCase()}-mission.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importMission() {
    try {
      const parsed = JSON.parse(importBlob) as {
        missionName?: string;
        missionType?: string;
        city?: string;
        district?: string;
        selectedDroneId?: string;
        selectedRobotId?: string;
        points?: MissionPoint[];
      };
      setMissionName(parsed.missionName ?? missionName);
      setMissionType(parsed.missionType ?? missionType);
      setCity(parsed.city ?? city);
      setDistrict(parsed.district ?? district);
      setSelectedDroneId(parsed.selectedDroneId ?? selectedDroneId);
      setSelectedRobotId(parsed.selectedRobotId ?? selectedRobotId);
      setPoints(parsed.points ?? []);
    } catch {
      // Keep current mission if import JSON fails.
    }
  }

  function saveMission() {
    localStorage.setItem("orca:mission:draft", JSON.stringify({ missionName, missionType, city, district, selectedDroneId, selectedRobotId, points }));
  }

  function loadMission() {
    const raw = localStorage.getItem("orca:mission:draft");
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        missionName: string;
        missionType: string;
        city: string;
        district: string;
        selectedDroneId: string;
        selectedRobotId: string;
        points: MissionPoint[];
      };
      setMissionName(parsed.missionName);
      setMissionType(parsed.missionType);
      setCity(parsed.city);
      setDistrict(parsed.district);
      setSelectedDroneId(parsed.selectedDroneId);
      setSelectedRobotId(parsed.selectedRobotId);
      setPoints(parsed.points ?? []);
    } catch {
      // Keep current mission state if saved draft cannot be parsed.
    }
  }

  function uploadMission() {
    if (points.length < 2 || !selectedDroneId) {
      return;
    }

    const assignmentPath = points.map((point) => ({ latitude: point.latitude, longitude: point.longitude, altitude_m: point.altitude_m }));

    createMission.mutate({
      name: missionName,
      city,
      district,
      radius_km: 6,
      assignments: [
        {
          asset_type: "drone",
          asset_id: selectedDroneId,
          path: assignmentPath,
          altitude_m: points[0].altitude_m,
          speed_mps: points[0].speed_mps,
        },
        ...(selectedRobotId
          ? [
              {
                asset_type: "robot" as const,
                asset_id: selectedRobotId,
                path: assignmentPath.map((point) => ({ ...point, altitude_m: 0 })),
                speed_mps: Math.max(1, points[0].speed_mps * 0.25),
              },
            ]
          : []),
      ],
    });
  }

  return (
    <CommandOpsLayout
      title="Mission Control"
      subtitle="QGroundControl + ROS2 Nav2 style mission planning, validation, simulation preview, and upload"
      navItems={navItems}
      connectionStatus={realtime.connected ? "websocket live" : "polling"}
      alertCount={0}
      statusItems={[
        { label: "Mission Type", value: missionType },
        { label: "Validation", value: validationMessage === "Mission validated" ? "pass" : "fail" },
        { label: "Live Missions", value: `${cityMissionsQuery.data?.length ?? 0}` },
      ]}
      telemetry={[
        { label: "Waypoints", value: `${points.length}` },
        { label: "Timeline", value: `${timeline.length} steps` },
        { label: "Simulation", value: points.length > 0 ? "ready" : "waiting" },
        { label: "Upload", value: createMission.isPending ? "in-progress" : "idle" },
        { label: "Drone", value: selectedDroneId || "not-selected" },
        { label: "Robot", value: selectedRobotId || "optional" },
      ]}
      logs={[
        validationMessage,
        `Mission action profiles: ${missionActions.join(", ")}`,
        `${cityMissionsQuery.data?.length ?? 0} missions stored in Mission Control`,
      ]}
    >
      <div className="ops-mission-layout">
        <section className="ops-panel ops-form-stack">
          <h3>Mission Editor</h3>
          <label>
            <span>Mission Name</span>
            <input value={missionName} onChange={(event) => setMissionName(event.target.value)} />
          </label>
          <label>
            <span>Mission Type</span>
            <select value={missionType} onChange={(event) => setMissionType(event.target.value)}>
              {missionTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            <span>City</span>
            <input value={city} onChange={(event) => setCity(event.target.value)} />
          </label>
          <label>
            <span>District</span>
            <input value={district} onChange={(event) => setDistrict(event.target.value)} />
          </label>
          <label>
            <span>Drone</span>
            <select value={selectedDroneId} onChange={(event) => setSelectedDroneId(event.target.value)}>
              <option value="">Select drone</option>
              {drones.map((drone) => (
                <option key={drone.drone_id} value={drone.drone_id}>{drone.drone_id}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Robot (optional)</span>
            <select value={selectedRobotId} onChange={(event) => setSelectedRobotId(event.target.value)}>
              <option value="">No robot</option>
              {robots.map((robot) => (
                <option key={robot.robot_id} value={robot.robot_id}>{robot.robot_id}</option>
              ))}
            </select>
          </label>

          <div className="ops-action-row">
            <button type="button" onClick={addWaypoint}>Add waypoint</button>
            <button type="button" onClick={saveMission}>Save mission</button>
            <button type="button" onClick={loadMission}>Load mission</button>
            <button type="button" onClick={exportMission}>Export mission</button>
            <button type="button" onClick={uploadMission}>Upload mission</button>
          </div>

          <h4>Import mission JSON</h4>
          <textarea value={importBlob} onChange={(event) => setImportBlob(event.target.value)} placeholder="Paste mission JSON here" />
          <button type="button" onClick={importMission}>Import mission</button>
        </section>

        <section className="ops-panel">
          <div className="ops-panel-head">
            <h3>Mission Timeline</h3>
            <span className="ops-chip">{validationMessage}</span>
          </div>
          <div className="ops-timeline">
            {points.map((point, index) => (
              <div key={`${point.latitude}-${point.longitude}-${index}`} className="ops-timeline-row">
                <strong>WP{index + 1}</strong>
                <input type="number" value={point.latitude} onChange={(event) => updateWaypoint(index, { latitude: Number(event.target.value) })} />
                <input type="number" value={point.longitude} onChange={(event) => updateWaypoint(index, { longitude: Number(event.target.value) })} />
                <input type="number" value={point.altitude_m} onChange={(event) => updateWaypoint(index, { altitude_m: Number(event.target.value) })} />
                <input type="number" value={point.speed_mps} onChange={(event) => updateWaypoint(index, { speed_mps: Number(event.target.value) })} />
                <select value={point.action} onChange={(event) => updateWaypoint(index, { action: event.target.value })}>
                  {missionActions.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
            ))}
            {points.length === 0 && <p className="ops-muted">No mission timeline yet.</p>}
          </div>

          <h3>Simulation Preview</h3>
          <CommandCenterMap
            assets={[]}
            threatAlerts={[]}
            zones={[]}
            selectedAssetId={null}
            drawPoints={points.map((point) => ({ latitude: point.latitude, longitude: point.longitude }))}
            onMapClick={() => undefined}
            onSelectAsset={() => undefined}
            mode="2d"
            cameraCorridors={[]}
            geoJsonLayers={[]}
          />
        </section>
      </div>
    </CommandOpsLayout>
  );
}
