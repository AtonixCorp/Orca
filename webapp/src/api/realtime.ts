import { useEffect, useState } from "react";

import { tokenStorage } from "./client";

interface RealtimeSnapshot {
  type: string;
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

function resolveRealtimeUrl() {
  const explicitUrl = import.meta.env.VITE_REALTIME_WS_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  if (typeof window === "undefined") {
    return "ws://localhost:8000/api/v1/events/stream";
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/v1/events/stream`;
}

export function useRealtimeCommandCenter(enabled = true) {
  const [snapshot, setSnapshot] = useState<RealtimeSnapshot | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || import.meta.env.MODE === "test") {
      return;
    }

    const token = tokenStorage.get();
    const url = new URL(resolveRealtimeUrl());
    if (token) {
      url.searchParams.set("token", token);
    }

    let isMounted = true;
    const socket = new WebSocket(url);

    socket.addEventListener("open", () => {
      if (isMounted) {
        setConnected(true);
      }
    });
    socket.addEventListener("close", () => {
      if (isMounted) {
        setConnected(false);
      }
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

    return () => {
      isMounted = false;
      socket.close();
    };
  }, [enabled]);

  return { snapshot, connected };
}