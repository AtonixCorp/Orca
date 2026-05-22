/**
 * ============================================================================
 * File: webapp/src/api/cameras.ts
 * Purpose:
 *   Typed client helpers for camera fleet registration state.
 * ============================================================================
 */

import { useQuery } from "@tanstack/react-query";

import { api } from "./client";

const BACKEND_ENABLED = import.meta.env.VITE_ENABLE_BACKEND === "true";

export type CameraDeviceType = "body_camera" | "micro_camera";
export type StreamStatus = "offline" | "connecting" | "live" | "degraded";

export interface CameraLocation {
  lat: number;
  lon: number;
  accuracy_m?: number | null;
}

export interface CameraDevice {
  id: string;
  device_id: string;
  device_type: CameraDeviceType;
  firmware_version: string;
  registered_at: string;
  last_seen_at: string;
  stream_status: StreamStatus;
  location?: CameraLocation | null;
  battery_level?: number | null;
  mounted?: boolean | null;
  tamper_detected: boolean;
}

export const demoCameraFleet: CameraDevice[] = [
  {
    id: "demo-body-001",
    device_id: "demo-body-001",
    device_type: "body_camera",
    firmware_version: "demo-1.0.0",
    registered_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    stream_status: "live",
    location: { lat: -1.2864, lon: 36.8172, accuracy_m: 4.2 },
    battery_level: 87,
    mounted: true,
    tamper_detected: false,
  },
  {
    id: "demo-micro-007",
    device_id: "demo-micro-007",
    device_type: "micro_camera",
    firmware_version: "demo-2.4.1",
    registered_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    stream_status: "connecting",
    location: { lat: -1.3102, lon: 36.8388, accuracy_m: 8 },
    battery_level: 52,
    mounted: true,
    tamper_detected: false,
  },
];

export async function fetchCameras(): Promise<CameraDevice[]> {
  if (!BACKEND_ENABLED) {
    return demoCameraFleet;
  }

  try {
    const { data } = await api.get<CameraDevice[]>("/cameras");
    return data;
  } catch {
    return demoCameraFleet;
  }
}

export function useCameras() {
  return useQuery({
    queryKey: ["cameras", "fleet"],
    queryFn: fetchCameras,
    refetchInterval: BACKEND_ENABLED ? 5_000 : false,
  });
}
