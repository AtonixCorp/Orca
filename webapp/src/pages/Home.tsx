/**
 * ============================================================================
 * File: webapp/src/pages/Home.tsx
 * Purpose:
 *   Landing page describing what SmartCito is and verifying frontend-to-backend
 *   API communication.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

<<<<<<< HEAD
type ApiStatus = "checking" | "online" | "offline";

const BACKEND_ENABLED = import.meta.env.VITE_ENABLE_BACKEND === "true";
=======
const coreFeatures = [
  {
    title: "Camera Integration",
    body: "Secure ingestion for RTSP and ONVIF streams, camera registration, stream telemetry, and tamper-aware field devices.",
  },
  {
    title: "GPS and IoT Modules",
    body: "USB, GPS, NMEA, MQTT, and sensor adapters normalize city device events into one operational backbone.",
  },
  {
    title: "Cloud Orchestration",
    body: "Kubernetes, Terraform, Docker Compose, and hardware-aware CI/CD support repeatable deployments from lab to cloud.",
  },
  {
    title: "Quantum-Safe Security",
    body: "RBAC, JWT, AES-GCM, audit trails, and post-quantum envelope services prepare the platform for future cryptography needs.",
  },
  {
    title: "Operator Dashboard",
    body: "The React control plane brings devices, security posture, data flow, and operator actions into one live interface.",
  },
];

const proofPoints = [
  { value: "5", label: "architecture layers" },
  { value: "4", label: "dashboard control modules" },
  { value: "PQC", label: "quantum-ready security" },
  { value: "CI", label: "hardware-aware validation" },
];

const governanceSignals = [
  "Apache 2.0 open-source licensing",
  "GitFlow branch governance and CI checks",
  "Security posture documented with audit trails",
  "Hardware, cloud, and dashboard modules validated together",
];

const architectureLayers = [
  "City devices and systems",
  "Ingestion and protocol adapters",
  "Storage and event backbone",
  "Security and audit controls",
  "SmartEdge dashboard",
];
>>>>>>> ea3017204e60172cfb4e16dd253e4f0dcb8566a1

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>(
    BACKEND_ENABLED ? "checking" : "offline",
  );

  useEffect(() => {
    if (!BACKEND_ENABLED) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/v1/health/live", { signal: controller.signal })
      .then((response) => {
        setApiStatus(response.ok ? "online" : "offline");
      })
      .catch(() => {
        setApiStatus("offline");
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="home-page">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Open smart city infrastructure</span>
          <h2>SmartCito</h2>
          <p>
            SmartCito is an open project dedicated to building secure,
            quantum-ready smart city infrastructure. It connects cameras, GPS,
            IoT devices, hardware services, and cloud systems into one unified
            backbone designed for transparency, security, and innovation.
          </p>

<<<<<<< HEAD
      <div className={`api-status ${apiStatus}`}>
        <strong>Backend API:</strong>{" "}
        {apiStatus === "checking" && "Checking connection…"}
        {apiStatus === "online" && "Connected"}
        {apiStatus === "offline" && "Offline — start citosmart backend"}
      </div>

      <ul className="hero-features">
        <li>🛰️ Unified ingestion (MQTT, Kafka, HTTP)</li>
        <li>🔐 Built-in RBAC, JWT, TLS, audit logs</li>
        <li>📊 Live dashboards for traffic, air quality, energy</li>
        <li>🌍 Apache 2.0 — open governance, open contributions</li>
      </ul>
=======
          <div className="foundation-strip" aria-label="Project positioning">
            <span>Open foundation ambition</span>
            <span>Security-first engineering</span>
            <span>City-scale control plane</span>
          </div>
>>>>>>> ea3017204e60172cfb4e16dd253e4f0dcb8566a1

          <div className="hero-actions">
            <Link className="btn primary" to="/dashboard">
              Open dashboard
            </Link>
            <Link className="btn" to="/architecture">
              Explore architecture
            </Link>
          </div>
        </div>

        <div className="city-scene" aria-hidden="true">
          <div className="scene-grid" />
          <div className="scene-node node-camera">CAM</div>
          <div className="scene-node node-gps">GPS</div>
          <div className="scene-node node-iot">IOT</div>
          <div className="scene-core">SmartEdge</div>
          <div className="scene-line line-a" />
          <div className="scene-line line-b" />
          <div className="scene-line line-c" />
        </div>
      </section>

      <section className="proof-band" aria-label="SmartCito proof points">
        {proofPoints.map((item) => (
          <div className="proof-item" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="content-section intro-section">
        <div>
          <span className="eyebrow">Mission</span>
          <h3>Open, collaborative, and future-proof by design.</h3>
          <p className="section-copy">
            The project is shaped like a professional open infrastructure
            program: public architecture, validated code paths, documented
            security posture, and a dashboard that operators can actually use.
          </p>
        </div>
        <div className="statement-list">
          <p>Create a foundation for smart cities that is open, collaborative, and future-proof.</p>
          <p>Ensure data security with post-quantum cryptography and strong audit controls.</p>
          <p>Empower developers, governments, and communities with open dashboards and APIs.</p>
        </div>
      </section>

      <section className="content-section foundation-section">
        <div className="section-heading">
          <span className="eyebrow">Foundation-grade posture</span>
          <h3>Built to look and operate like serious open infrastructure.</h3>
        </div>
        <div className="governance-grid">
          <article className="governance-panel primary-panel">
            <h4>Open governance baseline</h4>
            <p>
              SmartCito is positioned as an open project with clear contribution
              surfaces, visible security controls, modular infrastructure, and
              documentation that can grow into a foundation-style program.
            </p>
          </article>
          <div className="governance-list">
            {governanceSignals.map((signal) => (
              <div className="governance-item" key={signal}>
                <span />
                <strong>{signal}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Core features</span>
          <h3>Everything the platform has grown into.</h3>
        </div>
        <div className="feature-grid">
          {coreFeatures.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h4>{feature.title}</h4>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section architecture-preview">
        <div className="section-heading">
          <span className="eyebrow">Architecture overview</span>
          <h3>A layered backbone for real city operations.</h3>
        </div>
        <div className="layer-stack">
          {architectureLayers.map((layer, index) => (
            <div className="layer-row" key={layer}>
              <span>{index + 1}</span>
              <strong>{layer}</strong>
            </div>
          ))}
        </div>
        <img
          className="wide-visual"
          src="/assets/platform-overview.svg"
          alt="SmartCito platform overview"
        />
      </section>

      <section className="content-section split-section">
        <div>
          <span className="eyebrow">Community</span>
          <h3>Built so every discipline has a real place to contribute.</h3>
          <p>
            Developers can contribute services and containers. Designers can
            improve diagrams and Wiki visuals. Cloud engineers can expand
            infrastructure modules. Security experts can strengthen encryption,
            auditability, and compliance posture.
          </p>
        </div>
        <div className="outcome-panel">
          <h4>Outcome</h4>
          <p>
            SmartCito now reads as a personal open project with foundation-level
            ambition: transparent, visual, collaborative, and ready to evolve
            into a professional smart city infrastructure initiative.
          </p>
          <Link className="text-link" to="/community">View contribution paths</Link>
        </div>
      </section>
    </div>
  );
}
