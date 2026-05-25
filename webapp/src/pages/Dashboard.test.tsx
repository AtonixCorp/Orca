import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Dashboard from "./Dashboard";

vi.mock("@/components/ThreeDashboardPanel", () => ({
  default: () => (
    <section aria-label="SmartCito 3D control plane">
      <h3>SmartCito 3D Dashboard</h3>
    </section>
  ),
}));

vi.mock("@/api/controlPlane", () => ({
  useControlPlaneOverview: () => ({
    data: {
      devices: [
        {
          id: "usb-1",
          name: "USB GPS Receiver",
          category: "gps",
          trust_level: "verified",
          driver_container: "usb-service",
          endpoint: "/dev/ttyUSB0",
          firmware_version: "1.0.0",
          authenticated: true,
          signed_driver: true,
          last_seen_at: new Date().toISOString(),
        },
      ],
      security: {
        encryption_status: "ok",
        iam_status: "ok",
        audit_pipeline_status: "ok",
        quantum_safe_status: "ok",
        intrusion_alerts: [],
      },
      data_flow: [
        {
          id: "ingest",
          name: "Ingestion",
          protocol: "mqtt",
          state: "healthy",
          throughput_hint: "streaming",
          destination: "kafka",
        },
      ],
      controls: [
        {
          id: "usb-service",
          name: "USB Driver Service",
          description: "maps drivers",
          state: "running",
          policy_mode: "verified-only",
          action_label: "stop",
        },
      ],
    },
  }),
  useUpdateOperatorControl: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock("@/api/cameras", () => ({
  useCameras: () => ({ data: [], isLoading: false, isError: false }),
  demoCameraFleet: [],
}));

vi.mock("@/api/map", () => ({
  demoSmartMapDevices: [],
  useSmartMapOverview: () => ({
    data: {
      devices: [
        {
          id: "raspi-edge-001",
          device_id: "raspi-edge-001",
          name: "Raspberry Pi Edge Node",
          device_type: "iot",
          latitude: -25.7461,
          longitude: 28.1881,
          trust_score: 92,
          trust_level: "verified",
          camera_feed_url: "rtsp://edge/raspi-edge-001/camera",
          sensor_type: "air-quality",
          sensor_value: 0.74,
          gps_path: [[-25.7472, 28.1868], [-25.7461, 28.1881]],
          last_seen_at: new Date().toISOString(),
        },
      ],
      heatmap: [],
      visible_layers: ["verified-devices"],
      security_policy: "verified devices only",
    },
  }),
}));

vi.mock("@/api/scene", () => ({
  demoSceneOverview: {
    devices: [],
    threats: [],
    layers: ["iot-devices", "gps-paths", "camera-overlays", "threat-waves"],
    camera_overlay_mode: "popup-texture-ready",
    security_policy: "verified devices only",
  },
  useSceneOverview: () => ({
    data: {
      devices: [
        {
          id: "scene-raspi-edge-001",
          device_id: "scene-raspi-edge-001",
          name: "Raspberry Pi Edge Node",
          device_type: "iot",
          x: 1,
          y: 0.4,
          z: 1,
          latitude: -25.7461,
          longitude: 28.1881,
          trust_score: 92,
          trust_level: "verified",
          status_color: "#67d5a5",
          camera_feed_url: "rtsp://edge/scene-raspi-edge-001/camera",
          sensor_type: "air-quality",
          sensor_value: 0.74,
          gps_path_3d: [[0, 0.05, 0], [1, 0.05, 1]],
        },
      ],
      threats: [
        {
          id: "threat-scene-raspi-edge-001",
          x: 1,
          y: 0.04,
          z: 1,
          severity: "high",
          radius: 2.5,
          source_device_id: "scene-raspi-edge-001",
          label: "AI watch zone",
        },
      ],
      layers: ["iot-devices", "gps-paths", "camera-overlays", "threat-waves"],
      camera_overlay_mode: "popup-texture-ready",
      security_policy: "verified devices only",
    },
  }),
}));

vi.mock("@/api/droneGateway", () => ({
  demoDroneFleet: {
    drones: [
      {
        drone_id: "drone-patrol-001",
        protocol: "simulated",
        position: { latitude: -25.7454, longitude: 28.2438, altitude_m: 95 },
        speed_mps: 8.2,
        heading_deg: 90,
        battery_percent: 87,
        link_quality: 0.96,
        flight_mode: "patrol",
        status: "in_mission",
        health_flags: [],
        timestamp: new Date().toISOString(),
      },
    ],
    registry: [
      {
        drone_id: "drone-patrol-001",
        model: "SmartCito Simulated Patrol Drone",
        firmware_version: "sim-1.0.0",
        max_speed_mps: 18,
        max_altitude_m: 500,
        battery_capacity_mah: 6000,
        camera_types: ["rgb", "thermal", "zoom"],
        sensors: ["gps", "imu", "barometer"],
        payload_supported: true,
        status: "online",
        protocol: "simulated",
        last_seen_at: new Date().toISOString(),
      },
    ],
  },
  demoDroneMission: {
    mission_id: "mission-patrol-cbd-001",
    drone_id: "drone-patrol-001",
    name: "CBD perimeter patrol",
    status: "uploaded",
    altitude_m: 95,
    speed_mps: 8,
    progress_percent: 42,
    waypoints: [
      { latitude: -25.7479, longitude: 28.2293, altitude_m: 95, hold_seconds: 10 },
      { latitude: -25.7454, longitude: 28.2438, altitude_m: 95, hold_seconds: 12 },
    ],
  },
  demoCameraFeed: {
    drone_id: "drone-patrol-001",
    stream_url: "rtsp://drone-patrol-001/camera/main",
    preview_url: "/drone-camera/streams/drone-patrol-001/preview",
    camera_id: "rgb-main",
    ai_detections: [{ label: "vehicle", confidence: 0.91 }],
    gimbal: { pitch_deg: -18, yaw_deg: 32, zoom_level: 3 },
  },
  demoThreatAlerts: [
    {
      alert_id: "threat-drone-patrol-001",
      title: "High surveillance event: perimeter motion",
      threat_level: "high",
      source_ids: ["drone-patrol-001", "perimeter-sensor-003"],
      confidence: 0.86,
      recommended_actions: ["notify-operator"],
    },
  ],
  useDroneGatewayReady: () => ({
    data: {
      service: "drone-gateway",
      topics: {
        telemetry: "smartcito.drone.telemetry",
        events: "smartcito.drone.events",
      },
      protocols: ["simulated", "mavlink"],
      registry: "synced",
    },
    isError: false,
  }),
  useDroneFleet: () => ({
    data: {
      drones: [],
      registry: [
        {
          drone_id: "drone-patrol-001",
          model: "SmartCito Simulated Patrol Drone",
          firmware_version: "sim-1.0.0",
          max_speed_mps: 18,
          max_altitude_m: 500,
          battery_capacity_mah: 6000,
          camera_types: ["rgb", "thermal", "zoom"],
          sensors: ["gps", "imu", "barometer"],
          payload_supported: true,
          status: "online",
          protocol: "simulated",
          last_seen_at: new Date().toISOString(),
        },
      ],
    },
  }),
  useDroneGatewayMetrics: () => ({ data: 'smartcito_drone_gateway_events_total{event="commands_accepted"} 1' }),
  useDroneMissions: () => ({ data: [] }),
  useMappingOverlays: () => ({ data: { drones: [], sensors: [], threats: [], geofences: [] } }),
  useCameraFeeds: () => ({ data: [] }),
  useThreatAlerts: () => ({ data: [] }),
  useUploadDroneMission: () => ({ isPending: false, mutate: vi.fn() }),
  useConnectDrone: () => ({ isPending: false, mutate: vi.fn(), data: undefined }),
  useSendDroneCommand: () => ({ isPending: false, mutate: vi.fn(), data: undefined }),
}));

describe("Dashboard", () => {
  it("renders control-plane modules", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: /Device Manager/i })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /SmartCito 3D Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /SmartCito Map/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Drone Operations/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Infrastructure Configuration/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Kubernetes Configuration/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /OpenStack Configuration/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Drone Status Panel/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Drone Capability Panel/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Live Map View/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Mission Planner/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Camera Feed Panel/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Alerts & Threat Detection Panel/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Security Monitor/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Data Flow View/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Operator Controls/i })).toBeInTheDocument();
  });
});