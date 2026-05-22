import "./SmartCitoHomePage.css";

const capabilities = [
  {
    icon: "◉",
    title: "IoT Device Integration",
    description: "Real-time sensor and device connectivity.",
  },
  {
    icon: "⌖",
    title: "GPS & Location Fusion",
    description: "Country, region, area code, IP, and GPS combined into one accurate location.",
  },
  {
    icon: "▦",
    title: "2D/3D Map Visualization",
    description: "Live device placement, movement trails, and operational overlays.",
  },
  {
    icon: "▣",
    title: "Camera Streaming",
    description: "Secure video feeds linked directly to map coordinates.",
  },
  {
    icon: "△",
    title: "AI Insights",
    description: "Threat detection, anomaly detection, and predictive analytics.",
  },
  {
    icon: "◇",
    title: "Zero-Trust Security",
    description: "ATP protocol, encryption, identity scoring, and audit controls.",
  },
  {
    icon: "⬡",
    title: "Edge Computing",
    description: "Raspberry Pi and local processing for fast edge intelligence.",
  },
  {
    icon: "⇄",
    title: "CI/CD Automation",
    description: "GitLab pipeline for build, test, scan, deploy, and audit.",
  },
];

const locationSteps = [
  "Country selection",
  "Region selection",
  "Area code mapping",
  "IP geolocation",
  "GPS coordinates",
  "Confidence scoring",
  "Final fused location",
];

const technologies = [
  "Debian Containers",
  "OpenStack",
  "Kubernetes",
  "MQTT",
  "NATS",
  "CoAP",
  "HTTP",
  "GitLab CI/CD",
  "Python",
  "Node.js",
  "TypeScript",
  "WebGL",
];

export default function SmartCitoHomePage() {
  return (
    <main className="smartcito-home">
      <section className="home-hero-section">
        <div className="home-hero-content">
          <p className="home-kicker">SmartCito Sovereign City Intelligence</p>
          <h1>Sovereign Intelligence for Modern Cities</h1>
          <p className="home-hero-subtitle">
            SmartCito unifies IoT, GPS, Maps, Cameras, AI, and Cloud Security into one sovereign intelligence backbone.
          </p>

          <div className="home-actions">
            <a className="home-button primary" href="/dashboard">
              Open Dashboard
            </a>
            <a className="home-button" href="https://github.com/atonixdev/smartcito">
              Contribute on GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="home-section home-centered">
        <p className="home-kicker">What SmartCito Is</p>
        <h2>A unified intelligence platform for city-level operations.</h2>
        <p>
          SmartCito is a unified platform that connects IoT devices, GPS trackers,
          cameras, maps, AI analytics, and secure cloud infrastructure into one
          real-time intelligence system. It provides sovereign data control,
          encrypted communication, and a complete view of city-level operations.
        </p>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p className="home-kicker">Core Capabilities</p>
          <h2>One backbone for devices, location, visualization, security, and deployment.</h2>
        </div>

        <div className="capability-grid">
          {capabilities.map((item) => (
            <article className="capability-card" key={item.title}>
              <span className="capability-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section location-section">
        <div>
          <p className="home-kicker">Sovereign Location Intelligence</p>
          <h2>SmartCito does not depend on random or unverified locations.</h2>
          <p>
            The platform combines structured country and region selection with
            area code mapping, IP geolocation, GPS coordinates, confidence
            scoring, and final location fusion.
          </p>
        </div>

        <ul className="location-list">
          {locationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p className="home-kicker">Technology Stack</p>
          <h2>Built for secure infrastructure, edge devices, and cloud deployment.</h2>
        </div>

        <div className="technology-grid">
          {technologies.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      </section>

      <section className="home-cta-section">
        <p className="home-kicker">Start Building With SmartCito</p>
        <h2>Operate, secure, and visualize modern city infrastructure.</h2>
        <div className="home-actions center">
          <a className="home-button primary" href="/dashboard">
            Open Dashboard
          </a>
          <a className="home-button" href="/docs">
            Read Developer Docs
          </a>
          <a className="home-button" href="https://github.com/atonixdev/smartcito">
            Join the Foundation
          </a>
        </div>
      </section>
    </main>
  );
}
