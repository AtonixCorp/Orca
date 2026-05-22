export type VisualizationMode = "2d" | "3d";

export interface MapZone {
  id: string;
  label: string;
  x: number;
  y: number;
  risk: "low" | "medium" | "high";
}

export interface DeviceMarker {
  id: string;
  type: "iot" | "gps" | "camera" | "edge";
  status: "verified" | "unverified" | "blocked";
  trust_score: number;
  x: number;
  y: number;
  label: string;
}

export interface GpsPath {
  id: string;
  device_id: string;
  points: Array<{ x: number; y: number }>;
}

export interface TrafficMarker {
  id: string;
  label: string;
  level: "low" | "medium" | "high";
  x: number;
  y: number;
  value: number;
}

export interface ThreatMarker {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
  x: number;
  y: number;
}

export interface WeatherMarker {
  id: string;
  label: string;
  type: "rain" | "wind" | "heat";
  intensity: number;
  x: number;
  y: number;
}

export interface OperationsVisualizationPayload {
  generated_at: string;
  map: {
    name: string;
    center: { latitude: number; longitude: number };
    zones: MapZone[];
  };
  devices: DeviceMarker[];
  gps_paths: GpsPath[];
  traffic: TrafficMarker[];
  threats: ThreatMarker[];
  weather: WeatherMarker[];
}

export async function fetchOperationsVisualization(): Promise<OperationsVisualizationPayload> {
  const response = await fetch("/api/location/dashboard/visualization", {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Operations visualization API is not connected");
  }

  return response.json();
}
