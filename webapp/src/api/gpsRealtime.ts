import { useEffect, useMemo, useState } from "react";

import { tokenStorage } from "./client";
import type { DashboardStreamChannel } from "./realtime";

export type GpsDashboardChannel = Exclude<DashboardStreamChannel, "global"> | "global";

type StreamMessageType = "gps.snapshot" | "gps.update" | "gps.heartbeat";

export interface LiveGpsDevice {
  device_id: string;
  channel: GpsDashboardChannel;
  device_type: "drone" | "robot" | "vehicle" | "sensor" | "camera" | "iot" | "unknown";
  name: string;
  icon: string;
  color: string;
  status: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

interface GpsStreamMessage {
  type: StreamMessageType;
  channel: GpsDashboardChannel;
  generated_at: string;
  devices: LiveGpsDevice[];
}

function resolveGpsRealtimeUrl(channel: GpsDashboardChannel) {
  const explicitUrl = import.meta.env.VITE_GPS_WS_URL;
  if (explicitUrl) {
    if (explicitUrl.includes("{channel}")) {
      return explicitUrl.replace("{channel}", channel);
    }
    return `${explicitUrl.replace(/\/$/, "")}/${channel}`;
  }

  if (typeof window === "undefined") {
    return `ws://localhost:8000/api/v1/gps/stream/${channel}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/v1/gps/stream/${channel}`;
}

export function useGpsRealtime(channel: GpsDashboardChannel = "global", enabled = true) {
  const [connected, setConnected] = useState(false);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string | null>(null);
  const [devicesById, setDevicesById] = useState<Record<string, LiveGpsDevice>>({});

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || import.meta.env.MODE === "test") {
      return;
    }

    const token = tokenStorage.get();
    const url = new URL(resolveGpsRealtimeUrl(channel));
    if (token) {
      url.searchParams.set("token", token);
    }

    let isMounted = true;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let reconnectAttempt = 0;

    const clearReconnectTimer = () => {
      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const scheduleReconnect = () => {
      if (!isMounted) {
        return;
      }
      clearReconnectTimer();
      const delay = Math.min(1000 * 2 ** reconnectAttempt, 10000);
      reconnectAttempt += 1;
      reconnectTimer = window.setTimeout(() => {
        connect();
      }, delay);
    };

    const applyDevices = (items: LiveGpsDevice[]) => {
      setDevicesById((current) => {
        const next = { ...current };
        for (const item of items) {
          next[item.device_id] = item;
        }
        return next;
      });
    };

    const handleFrame = (frame: GpsStreamMessage) => {
      if (frame.type === "gps.heartbeat") {
        setLastHeartbeatAt(frame.generated_at);
        return;
      }

      if (frame.type === "gps.snapshot") {
        const reset: Record<string, LiveGpsDevice> = {};
        for (const item of frame.devices) {
          reset[item.device_id] = item;
        }
        setDevicesById(reset);
        return;
      }

      applyDevices(frame.devices);
    };

    const connect = () => {
      if (!isMounted) {
        return;
      }

      socket = new WebSocket(url);

      socket.addEventListener("open", () => {
        if (!isMounted) {
          return;
        }
        reconnectAttempt = 0;
        setConnected(true);
      });

      socket.addEventListener("close", () => {
        if (!isMounted) {
          return;
        }
        setConnected(false);
        scheduleReconnect();
      });

      socket.addEventListener("error", () => {
        if (!isMounted) {
          return;
        }
        setConnected(false);
      });

      socket.addEventListener("message", (event) => {
        if (!isMounted) {
          return;
        }

        try {
          handleFrame(JSON.parse(event.data) as GpsStreamMessage);
        } catch {
          setConnected(false);
        }
      });
    };

    connect();

    return () => {
      isMounted = false;
      clearReconnectTimer();
      socket?.close();
    };
  }, [channel, enabled]);

  const devices = useMemo(() => Object.values(devicesById), [devicesById]);

  return {
    connected,
    devices,
    lastHeartbeatAt,
  };
}
