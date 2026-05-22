import "./HomeLanding.css";

const platformModules = [
  "IoT Sensors",
  "GPS Tracking",
  "Traffic Systems",
  "2D / 3D Maps",
  "Camera Feeds",
  "Weather Layers",
  "AI Threat Detection",
  "ATP Security Ledger",
];

const capabilities = [
  {
    title: "Unified ingestion",
    text: "MQTT, Kafka, HTTP, Raspberry Pi, GPS modules, cameras, and city systems feed one backbone.",
    icon: "🛰️",
  },
  {
    title: "Location intelligence",
    text: "Country, region, area code, IP geolocation, GPS, and device-reported location are fused together.",
    icon: "🌍",
  },
  {
    title: "2D / 3D visualization",
    text: "Operators can view GPS paths, traffic, threats, weather, devices, and maps in one dashboard.",
    icon: "🗺️",
  },
  {
    title: "Secure by design",
    text: "JWT, RBAC, TLS, encrypted communication, ATP audit logs, and trust-scored device rendering.",
    icon: "🔐",
  },
];

const stats = [
  ["Real-time", "City intelligence"],
  ["2D + 3D", "Map visualization"],
  ["ATP", "Signed audit trail"],
  ["Open", "Apache 2.0 governance"],
];

export default function HomeLanding() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-eyebrow">Urban Data Backbone for Smart Cities</p>
          <h1>SmartCito unifies city infrastructure into one secure operations platform.</h1>
          <p>
            SmartCito connects IoT sensors, GPS devices, traffic systems, cameras,
            utilities, weather layers, AI threat detection, and citizen services into
            one real-time, privacy-by-design intelligence hub.
          </p>

          <div className="home-status">
            <span className="status-dot offline" />
            Backend API: Offline — start <code>citosmart</code> backend
          </div>

          <div className="home-actions">
            <a className="home-btn primary" href="/dashboard">
              Open dashboard →
            </a>
            <a className="home-btn" href="https://github.com/atonixdev/smartcito">
              Contribute on GitHub
            </a>
          </div>
        </div>

        <div className="home-map-card">
          <div className="home-map-visual">
            <div className="home-map-grid" />
            <span className="home-road road-a" />
            <span className="home-road road-b" />
            <span className="map-pin iot">IoT</span>
            <span className="map-pin gps">GPS</span>
            <span className="map-pin cam">CAM</span>
            <span className="map-pin traffic">TRF</span>
            <span className="map-pin weather">WX</span>
            <span className="map-threat" />
          </div>
          <div className="home-map-footer">
            <strong>Live Operations Map</strong>
            <small>GPS · Traffic · Threat · Weather · Device · Map</small>
          </div>
        </div>
      </section>

      <section className="home-stats">
        {stats.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <p className="home-eyebrow">Platform Capabilities</p>
          <h2>One dashboard, multiple city-intelligence views.</h2>
          <p>
            SmartCito is not a collection of disconnected dashboards. It is one
            professional control plane where every module shares authenticated data,
            verified location, and a common map layer.
          </p>
        </div>

        <div className="capability-grid">
          {capabilities.map((item) => (
            <article className="capability-card" key={item.title}>
              <span>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <p className="home-eyebrow">SmartCito Modules</p>
          <h2>Everything needed for edge-city operations.</h2>
        </div>

        <div className="module-grid">
          {platformModules.map((module) => (
            <article key={module} className="module-card">
              <span />
              <strong>{module}</strong>
              <small>Connected to the SmartCito backbone</small>
            </article>
          ))}
        </div>
      </section>

      <section className="home-split">
        <div>
          <p className="home-eyebrow">Location Intelligence</p>
          <h2>No random locations. Every map point is verified.</h2>
          <p>
            SmartCito combines country selection, region mapping, area-code lookup,
            IP geolocation, GPS tracking, and device-reported location into one
            confidence-scored output for 2D and 3D map placement.
          </p>
        </div>

        <div className="fusion-flow">
          <span>Country</span>
          <span>Region</span>
          <span>Area Code</span>
          <span>IP Geolocation</span>
          <span>GPS</span>
          <strong>Unified Location</strong>
        </div>
      </section>

      <section className="home-split reverse">
        <div className="security-box">
          <strong>Security Foundation</strong>
          <ul>
            <li>JWT and role-based access control</li>
            <li>TLS and encrypted data channels</li>
            <li>ATP-signed location and visualization events</li>
            <li>Trust-colored devices: verified, unverified, blocked</li>
            <li>Only authenticated devices appear on the map</li>
          </ul>
        </div>

        <div>
          <p className="home-eyebrow">Secure Infrastructure</p>
          <h2>Built for city operators, developers, and infrastructure teams.</h2>
          <p>
            SmartCito is designed for OpenStack, Kubernetes, Debian-based
            containers, Raspberry Pi edge nodes, and auditable city-scale operations.
          </p>
        </div>
      </section>
    </main>
  );
}
