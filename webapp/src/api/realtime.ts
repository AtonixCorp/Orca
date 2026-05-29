import { useEffect, useState } from "react";

import { tokenStorage } from "./client";

export type DashboardStreamChannel = "global" | "drone" | "robot" | "city" | "mission" | "individualization";

interface RealtimeSnapshot {
  type: string;
  channel?: DashboardStreamChannel;
  generated_at: string;
  events: Array<Record<string, unknown>>;
  alerts: Array<Record<string, unknown>>;
  control_plane: Record<string, unknown>;
  map: Record<string, unknown>;
  surveillance: {
    drones: Record<string, unknown>;
    missions: Array<Record<string, unknown>>;
    camera_feeds: Array<Record<string, unknown>>;
    threat_alerts: Array<Record<string, unknown>>;
    mapping_overlays: Record<string, unknown>;
  };
}

function resolveRealtimeUrl(channel: DashboardStreamChannel) {
  const explicitUrl = import.meta.env.VITE_REALTIME_WS_URL;
  if (explicitUrl) {
    if (explicitUrl.includes("{channel}")) {
      return explicitUrl.replace("{channel}", channel);
    }
    return `${explicitUrl.replace(/\/$/, "")}/${channel}`;
  }

  if (typeof window === "undefined") {
    return `ws://localhost:8000/api/v1/events/stream/${channel}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/v1/events/stream/${channel}`;
}

export function useRealtimeCommandCenter(channel: DashboardStreamChannel = "global", enabled = true) {
  const [snapshot, setSnapshot] = useState<RealtimeSnapshot | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || import.meta.env.MODE === "test") {
      return;
    }

    const token = tokenStorage.get();
    const url = new URL(resolveRealtimeUrl(channel));
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
          setSnapshot(JSON.parse(event.data) as RealtimeSnapshot);
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

  return { snapshot, connected };
}