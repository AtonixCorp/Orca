/**
 * ============================================================================
 * File: webapp/src/pages/OperatorControlCenter.tsx
 * Purpose:
 *   Desktop-first operator control center for macOS and Windows packaging.
 *   The layout favors large screens, multiple panels, and dense telemetry.
 * ============================================================================
 */

const missionSummary = [
  { label: "Active Assets", value: "18", detail: "12 airborne / 6 ground" },
  { label: "Open Alerts", value: "04", detail: "2 critical / 2 warning" },
  { label: "Video Streams", value: "11", detail: "9 healthy / 2 degraded" },
  { label: "AI Detections", value: "37", detail: "last 30 min" },
];

const devices = [
  {
    name: "Drone-07 / North Perimeter",
    status: "On patrol",
    battery: "82%",
    link: "Uplink 18 ms",
    payload: "EO/IR stabilized",
    variant: "ok",
  },
  {
    name: "Drone-14 / Harbor Sweep",
    status: "Investigating anomaly",
    battery: "61%",
    link: "Uplink 24 ms",
    payload: "Thermal + spotlight",
    variant: "danger",
  },
  {
    name: "Rover-03 / Gate Bravo",
    status: "Autonomous patrol",
    battery: "74%",
    link: "Mesh 11 ms",
    payload: "Lidar + siren",
    variant: "ok",
  },
  {
    name: "Cam-22 / Loading Bay",
    status: "Tracking vehicle",
    battery: "External",
    link: "Fiber relay",
    payload: "4K analytics",
    variant: "alert",
  },
];

const liveFeeds = [
  {
    title: "North tower overwatch",
    meta: "Drone-07",
    state: "LIVE",
    detail: "3 targets classified",
  },
  {
    title: "Harbor thermal corridor",
    meta: "Drone-14",
    state: "TRACKING",
    detail: "Heat signature retained",
  },
  {
    title: "Gate Bravo sentry",
    meta: "Cam-22",
    state: "LIVE",
    detail: "License OCR stable",
  },
];

const detections = [
  {
    title: "Unscheduled vehicle pause",
    detail: "AI fused ANPR and dwell-time anomaly at loading corridor west.",
    tags: ["confidence 0.94", "camera mesh", "response ready"],
  },
  {
    title: "Thermal silhouette near fence line",
    detail: "Cross-confirmed by Drone-14 infrared sweep and perimeter motion array.",
    tags: ["confidence 0.88", "thermal", "operator review"],
  },
  {
    title: "RF interference spike",
    detail: "Short-duration jammer-like profile detected on sector C command link.",
    tags: ["spectrum", "priority medium", "reroute mesh"],
  },
];

const eventLog = [
  {
    time: "21:04",
    title: "Drone-14 entered assisted pursuit mode",
    detail: "Autonomy handoff limited speed and widened safe corridor near dock cranes.",
    tags: ["flight safety", "assist"],
  },
  {
    time: "20:58",
    title: "Mission queue updated by Shift Lead Alpha",
    detail: "Night perimeter sweep inserted after thermal anomaly correlation exceeded threshold.",
    tags: ["mission plan", "audit"],
  },
  {
    time: "20:51",
    title: "Rover-03 battery reserve prediction adjusted",
    detail: "Terrain drag increased consumption model by 6 minutes.",
    tags: ["telemetry", "predictive"],
  },
  {
    time: "20:44",
    title: "Camera mesh path failed over cleanly",
    detail: "ORCA switched to secondary relay without feed interruption during port switch reset.",
    tags: ["network", "healthy"],
  },
];

const missionCommands = [
  { title: "Launch intercept", detail: "Dispatch nearest airframe with geofence safety." },
  { title: "Silent track", detail: "Continue sensor lock without visible deterrence." },
  { title: "Deploy rover", detail: "Move ground unit to checkpoint with live escort." },
  { title: "Seal corridor", detail: "Coordinate cameras, lights, and access control." },
];

export default function OperatorControlCenter() {
  return (
    <section className="desktop-operator-page">
      <div className="desktop-operator-shell">
        <div className="desktop-command-bar">
          <article className="desktop-panel">
            <div className="desktop-panel-inner">
              <div className="desktop-command-copy">
                <span className="desktop-eyebrow">Desktop Operator Runtime</span>
                <h2>ORCA multi-panel control center for mission command and local-first response.</h2>
                <p>
                  Built for Windows workstations and macOS control desks, this screen concentrates live
                  feeds, telemetry, asset posture, AI detections, and command actions into a single
                  desktop surface that scales across large monitors and GPU-backed rendering.
                </p>
              </div>
              <div className="desktop-tag-row">
                <span className="desktop-chip is-ok">Local-first control</span>
                <span className="desktop-chip">Multi-monitor ready</span>
                <span className="desktop-chip">GPU visualization active</span>
                <span className="desktop-chip is-alert">2 feeds degraded</span>
              </div>
              <div className="desktop-command-actions">
                <button className="desktop-action" type="button">
                  Arm response plan
                </button>
                <button className="desktop-action-secondary" type="button">
                  Open mission queue
                </button>
                <button className="desktop-action-secondary" type="button">
                  Review device onboarding
                </button>
              </div>
            </div>
          </article>

          <article className="desktop-panel desktop-summary-card">
            <div className="desktop-panel-inner">
              <div className="desktop-panel-header">
                <div>
                  <span className="desktop-eyebrow">Desktop Session</span>
                  <h3>Control station posture</h3>
                  <p>Windows `.exe` and macOS `.dmg` package the same mission UI.</p>
                </div>
                <div className="desktop-window-chrome">
                  <span className="desktop-window-pill">macOS</span>
                  <span className="desktop-window-pill">Windows</span>
                </div>
              </div>
              <div className="desktop-stack-list">
                <li>
                  <strong>Shift mode</strong>
                  <p>Night security operations / perimeter and harbor watch</p>
                </li>
                <li>
                  <strong>Site topology</strong>
                  <p>4 sectors, 2 relay towers, 1 remote uplink fallback</p>
                </li>
                <li>
                  <strong>Engineering lane</strong>
                  <p>CLI tools, firmware staging, and onboarding panels stay local</p>
                </li>
              </div>
            </div>
          </article>
        </div>

        <div className="desktop-summary-strip">
          {missionSummary.map((item) => (
            <article className="desktop-panel desktop-summary-card" key={item.label}>
              <div className="desktop-panel-inner">
                <span className="desktop-eyebrow">{item.label}</span>
                <strong>{item.value}</strong>
                <span>{item.detail}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="desktop-main-grid">
          <article className="desktop-panel">
            <div className="desktop-panel-inner">
              <div className="desktop-panel-header">
                <div>
                  <span className="desktop-eyebrow">Mission Map</span>
                  <h3>2D / 3D command view</h3>
                  <p>Live asset positions, response corridors, and fenced sectors.</p>
                </div>
                <div className="desktop-segmented-actions">
                  <span className="desktop-pill is-ok">Cesium-ready</span>
                  <span className="desktop-pill">MapLibre routing</span>
                </div>
              </div>

              <div className="desktop-map-stage">
                <div aria-hidden="true" className="desktop-map-grid" />
                <svg aria-hidden="true" className="desktop-map-routes" viewBox="0 0 1000 620" preserveAspectRatio="none">
                  <path d="M110 490 C 220 350, 320 340, 430 260 S 690 130, 860 180" />
                  <path d="M240 170 C 370 210, 470 300, 560 340 S 740 410, 900 520" />
                </svg>
                <div aria-hidden="true" className="desktop-map-sector" />
                <div className="desktop-map-marker" style={{ "--x": "23%", "--y": "69%", "--marker-color": "#67d5a5" } as React.CSSProperties}>
                  <span>Drone-07</span>
                </div>
                <div className="desktop-map-marker" style={{ "--x": "64%", "--y": "34%", "--marker-color": "#f1c96b" } as React.CSSProperties}>
                  <span>Drone-14</span>
                </div>
                <div className="desktop-map-marker" style={{ "--x": "45%", "--y": "56%", "--marker-color": "#00e5ff" } as React.CSSProperties}>
                  <span>Rover-03</span>
                </div>
                <div className="desktop-map-marker" style={{ "--x": "81%", "--y": "72%", "--marker-color": "#f87171" } as React.CSSProperties}>
                  <span>Alert sector C</span>
                </div>

                <aside className="desktop-map-sidebar">
                  <section className="desktop-stack-section">
                    <span className="desktop-eyebrow">Mission Focus</span>
                    <h3>Harbor anomaly intercept</h3>
                    <p>Air asset shadowing suspect vehicle while rover closes checkpoint.</p>
                  </section>
                  <section className="desktop-stack-section">
                    <span className="desktop-eyebrow">Map Legend</span>
                    <div className="desktop-map-legend">
                      <span className="desktop-pill is-ok">Patrol assets</span>
                      <span className="desktop-pill">Sensors</span>
                      <span className="desktop-pill is-danger">Incidents</span>
                    </div>
                  </section>
                  <section className="desktop-stack-section">
                    <span className="desktop-eyebrow">Autonomy Stack</span>
                    <ul className="desktop-stack-list">
                      <li>
                        <strong>Flight corridor solver</strong>
                        <p>Wind-adjusted, safe return margin preserved.</p>
                      </li>
                      <li>
                        <strong>Sensor fusion</strong>
                        <p>Thermal, OCR, lidar, and mesh telemetry aligned.</p>
                      </li>
                      <li>
                        <strong>Fallback mesh</strong>
                        <p>Secondary relay available if port sector saturates.</p>
                      </li>
                    </ul>
                  </section>
                </aside>
              </div>
            </div>
          </article>

          <div className="desktop-live-column">
            <article className="desktop-panel">
              <div className="desktop-panel-inner">
                <div className="desktop-panel-header">
                  <div>
                    <span className="desktop-eyebrow">Live Feeds</span>
                    <h3>Video and sensor views</h3>
                    <p>Designed for desktop GPU compositing and multi-panel review.</p>
                  </div>
                  <span className="desktop-pill">11 streams</span>
                </div>
                <div className="desktop-feed-list">
                  {liveFeeds.map((feed) => (
                    <article className="desktop-feed-card" key={feed.title}>
                      <div className="desktop-feed-preview">
                        <div className="desktop-feed-overlay">
                          <span className="desktop-feed-stat">{feed.state}</span>
                          <span className="desktop-feed-stat">{feed.meta}</span>
                        </div>
                      </div>
                      <div className="desktop-feed-meta">
                        <div className="desktop-feed-title">
                          <strong>{feed.title}</strong>
                          <span className="desktop-pill">{feed.meta}</span>
                        </div>
                        <p>{feed.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </article>

            <article className="desktop-panel">
              <div className="desktop-panel-inner">
                <div className="desktop-panel-header">
                  <div>
                    <span className="desktop-eyebrow">Telemetry</span>
                    <h3>Health and runtime posture</h3>
                  </div>
                  <span className="desktop-pill is-ok">Nominal</span>
                </div>
                <div className="desktop-panel-stat-grid">
                  <article className="desktop-stat-card">
                    <span className="desktop-eyebrow">Battery Floor</span>
                    <strong>61%</strong>
                    <span>Drone-14 is the lowest active air asset</span>
                  </article>
                  <article className="desktop-stat-card">
                    <span className="desktop-eyebrow">GPS Drift</span>
                    <strong>0.3 m</strong>
                    <span>All active assets within calibration bounds</span>
                  </article>
                  <article className="desktop-stat-card">
                    <span className="desktop-eyebrow">Mesh Latency</span>
                    <strong>18 ms</strong>
                    <span>Average command uplink across sectors</span>
                  </article>
                  <article className="desktop-stat-card">
                    <span className="desktop-eyebrow">AI Queue</span>
                    <strong>1.2 s</strong>
                    <span>Inference lag for object and event fusion</span>
                  </article>
                </div>
              </div>
            </article>
          </div>

          <div className="desktop-right-column">
            <article className="desktop-panel">
              <div className="desktop-panel-inner">
                <div className="desktop-panel-header">
                  <div>
                    <span className="desktop-eyebrow">Mission Control</span>
                    <h3>Immediate operator actions</h3>
                  </div>
                  <span className="desktop-pill">4 ready</span>
                </div>
                <div className="desktop-control-grid">
                  {missionCommands.map((command) => (
                    <button className="desktop-control-button" key={command.title} type="button">
                      <strong>{command.title}</strong>
                      <span>{command.detail}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>

            <article className="desktop-panel">
              <div className="desktop-panel-inner">
                <div className="desktop-panel-header">
                  <div>
                    <span className="desktop-eyebrow">Devices</span>
                    <h3>Fleet and sensor status</h3>
                  </div>
                  <span className="desktop-pill is-ok">18 online</span>
                </div>
                <div className="desktop-device-list">
                  {devices.map((device) => (
                    <article className="desktop-device-card" key={device.name}>
                      <div className="desktop-device-title">
                        <strong>{device.name}</strong>
                        <span className={`desktop-pill${device.variant === "danger" ? " is-danger" : device.variant === "ok" ? " is-ok" : ""}`}>
                          {device.status}
                        </span>
                      </div>
                      <div className="desktop-device-meta">
                        <span className="desktop-chip">{device.battery}</span>
                        <span className="desktop-chip">{device.link}</span>
                        <span className="desktop-chip">{device.payload}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="desktop-bottom-grid">
          <article className="desktop-panel">
            <div className="desktop-panel-inner">
              <div className="desktop-panel-header">
                <div>
                  <span className="desktop-eyebrow">AI Detections</span>
                  <h3>Events requiring operator judgment</h3>
                </div>
                <div className="desktop-secondary-actions">
                  <button className="desktop-action-secondary" type="button">
                    Open evidence bundle
                  </button>
                </div>
              </div>
              <div className="desktop-detection-list">
                {detections.map((detection) => (
                  <article className="desktop-detection-card" key={detection.title}>
                    <strong>{detection.title}</strong>
                    <p>{detection.detail}</p>
                    <div className="desktop-detection-tags">
                      {detection.tags.map((tag) => (
                        <span className="desktop-chip" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </article>

          <article className="desktop-panel">
            <div className="desktop-panel-inner">
              <div className="desktop-panel-header">
                <div>
                  <span className="desktop-eyebrow">Event Log</span>
                  <h3>Audit and mission timeline</h3>
                </div>
                <span className="desktop-pill">Real-time sync</span>
              </div>
              <div className="desktop-log-list">
                {eventLog.map((entry) => (
                  <article className="desktop-log-card" key={`${entry.time}-${entry.title}`}>
                    <span className="desktop-log-time">{entry.time}</span>
                    <div>
                      <strong>{entry.title}</strong>
                      <p>{entry.detail}</p>
                      <div className="desktop-log-tags">
                        {entry.tags.map((tag) => (
                          <span className="desktop-chip" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}