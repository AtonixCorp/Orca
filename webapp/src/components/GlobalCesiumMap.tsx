import { useEffect, useMemo, useRef } from "react";

import {
  Cartesian3,
  Color,
  Ion,
  LabelStyle,
  PolylineGlowMaterialProperty,
  Viewer,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import type { LiveGpsDevice } from "@/api/gpsRealtime";

interface Props {
  devices: LiveGpsDevice[];
  missionPath?: Array<{ latitude: number; longitude: number; altitude?: number }>;
  className?: string;
}

function colorFromHex(hex: string) {
  try {
    return Color.fromCssColorString(hex);
  } catch {
    return Color.fromCssColorString("#57c7d4");
  }
}

export default function GlobalCesiumMap({ devices, missionPath = [], className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current || import.meta.env.MODE === "test") {
      return;
    }

    Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN ?? "";

    const viewer = new Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: true,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      fullscreenButton: false,
      selectionIndicator: false,
      infoBox: false,
      shouldAnimate: true,
    });

    viewer.scene.globe.enableLighting = true;
    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  const pathPositions = useMemo(
    () => missionPath.map((point) => Cartesian3.fromDegrees(point.longitude, point.latitude, point.altitude ?? 120)),
    [missionPath],
  );

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    viewer.entities.removeAll();

    devices.forEach((device) => {
      viewer.entities.add({
        id: device.device_id,
        name: device.name,
        position: Cartesian3.fromDegrees(device.longitude, device.latitude, device.altitude ?? 0),
        point: {
          pixelSize: 10,
          color: colorFromHex(device.color),
          outlineColor: Color.BLACK,
          outlineWidth: 1,
        },
        label: {
          text: device.name,
          fillColor: Color.WHITE,
          style: LabelStyle.FILL_AND_OUTLINE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          pixelOffset: new Cartesian3(0, -20, 0),
          scale: 0.45,
        },
      });
    });

    if (pathPositions.length > 1) {
      viewer.entities.add({
        name: "Mission Path",
        polyline: {
          positions: pathPositions,
          width: 3,
          material: new PolylineGlowMaterialProperty({
            color: Color.CYAN,
            glowPower: 0.2,
          }),
        },
      });
    }

    if (devices.length > 0) {
      const first = devices[0];
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(first.longitude, first.latitude, 2000000),
        duration: 0.7,
      });
    }
  }, [devices, pathPositions]);

  return <div ref={containerRef} className={className ?? "global-map-canvas"} aria-label="Cesium global operations globe" />;
}
