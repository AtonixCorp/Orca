import { Link } from "react-router-dom";

const hubCards = [
  { to: "/dashboard/drone", title: "Enter Drone Dashboard", detail: "Flight attitude, GPS trail, mission path, wind vectors, camera telemetry" },
  { to: "/dashboard/robot", title: "Enter Robot Dashboard", detail: "URDF/SDF scene, lidar, SLAM overlays, joint and sensor state" },
  { to: "/dashboard/city", title: "Enter City Map", detail: "2D/3D geospatial command map with geofences, zones, and live assets" },
  { to: "/dashboard/mission", title: "Enter Mission Control", detail: "Create, validate, simulate, and upload coordinated drone-robot missions" },
  { to: "/dashboard/individualization", title: "Enter Individualization", detail: "Firmware, hardware capability, sensors, calibration, and AI module profile" },
];

export default function NavigationHubPage() {
  return (
    <section className="nav-hub" aria-label="ORCA Command Center Navigation Hub">
      <header className="nav-hub-header">
        <span>ORCA Command Center</span>
        <h1>Enterprise Navigation Hub</h1>
        <p>Choose a dedicated full-screen workspace. Each dashboard runs independently for high-density telemetry and visualization performance.</p>
      </header>

      <div className="nav-hub-grid">
        {hubCards.map((card) => (
          <Link key={card.to} to={card.to} className="nav-hub-card">
            <strong>{card.title}</strong>
            <span>{card.detail}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
