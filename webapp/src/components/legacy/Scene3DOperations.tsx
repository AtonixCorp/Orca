/**
 * ============================================================================
 * File: webapp/src/components/legacy/Scene3DOperations.tsx
 * Purpose:
 *   Legacy 3D operational scene migrated from the old dashboard asset folder.
 *   Kept as a lightweight reference scene alongside the richer ThreeDashboardPanel.
 * ============================================================================
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface LegacySceneDevice {
  id: string;
  type: "iot" | "camera" | "gps" | "edge";
  x: number;
  z: number;
}

const demoDevices: LegacySceneDevice[] = [
  { id: "iot-1", type: "iot", x: -40, z: -20 },
  { id: "cam-1", type: "camera", x: 30, z: -35 },
  { id: "gps-1", type: "gps", x: 50, z: 20 },
  { id: "pi-1", type: "edge", x: -30, z: 40 },
  { id: "iot-2", type: "iot", x: 10, z: 55 },
];

const deviceColors: Record<LegacySceneDevice["type"], number> = {
  iot: 0x4cc9f0,
  camera: 0xef476f,
  gps: 0xffd166,
  edge: 0x90e0ef,
};

export default function Scene3DOperations({ devices = demoDevices }: { devices?: LegacySceneDevice[] }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const width = mount.clientWidth;
    const height = mount.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1220);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 60, 90);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x506080, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 80, 50);
    scene.add(directionalLight);

    scene.add(new THREE.GridHelper(200, 40, 0x4cc9f0, 0x1c2740));

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x111b2e, roughness: 0.9 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4, 6, 24),
      new THREE.MeshStandardMaterial({
        color: 0x06d6a0,
        emissive: 0x06d6a0,
        emissiveIntensity: 0.4,
      }),
    );
    hub.position.y = 3;
    scene.add(hub);

    const arcs: Array<{ curve: THREE.QuadraticBezierCurve3; packet: THREE.Mesh; t: number }> = [];

    devices.forEach((device) => {
      const color = deviceColors[device.type] ?? 0xffffff;

      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 16, 16),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 }),
      );
      pin.position.set(device.x, 2, device.z);
      scene.add(pin);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(2.4, 3.2, 32),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        }),
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(device.x, 0.1, device.z);
      scene.add(halo);

      const start = new THREE.Vector3(device.x, 2, device.z);
      const end = new THREE.Vector3(0, 5, 0);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.y += 20;

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 40, 0.15, 8, false),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 }),
      );
      scene.add(tube);

      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshBasicMaterial({ color }),
      );
      scene.add(packet);

      arcs.push({ curve, packet, t: Math.random() });
    });

    const clock = new THREE.Clock();
    let frame = 0;

    function animate() {
      const delta = clock.getDelta();
      hub.rotation.y += delta * 0.5;

      arcs.forEach((arc) => {
        arc.t += delta * 0.25;
        if (arc.t > 1) {
          arc.t = 0;
        }
        arc.packet.position.copy(arc.curve.getPoint(arc.t));
      });

      const elapsed = clock.elapsedTime;
      camera.position.x = Math.sin(elapsed * 0.15) * 110;
      camera.position.z = Math.cos(elapsed * 0.15) * 110;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    animate();

    function handleResize() {
      if (!mount) {
        return;
      }
      const nextWidth = mount.clientWidth;
      const nextHeight = mount.clientHeight || 480;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount?.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [devices]);

  return <div ref={mountRef} className="legacy-scene-panel" />;
}