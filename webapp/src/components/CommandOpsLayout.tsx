import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
}

interface TelemetryItem {
  label: string;
  value: string;
  tone?: "normal" | "warn" | "critical";
}

interface CommandOpsLayoutProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  statusItems: Array<{ label: string; value: string }>;
  alertCount?: number;
  connectionStatus?: string;
  telemetry: TelemetryItem[];
  logs: string[];
  children: ReactNode;
}

function toneClass(tone: TelemetryItem["tone"]) {
  if (tone === "critical") {
    return "is-critical";
  }
  if (tone === "warn") {
    return "is-warn";
  }
  return "is-normal";
}

export default function CommandOpsLayout({
  title,
  subtitle,
  navItems,
  statusItems,
  alertCount = 0,
  connectionStatus = "unknown",
  telemetry,
  logs,
  children,
}: CommandOpsLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [stayMode, setStayMode] = useState(true);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  const selectedDashboard = useMemo(
    () => navItems.find((item) => item.to === location.pathname)?.to ?? "",
    [location.pathname, navItems],
  );

  return (
    <section className="ops-shell" aria-label="Orca operations command center">
      <div className="ops-main-column">
        <header className="ops-topbar">
          <div className="ops-topbar-meta">
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <div className="ops-header-chips">
              <span>Connection: {connectionStatus}</span>
              <span>Alerts: {alertCount}</span>
              <span>{clock.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="ops-topbar-actions">
            <Link className="ops-topbar-button" to="/hub">Return to Hub</Link>
            <button
              type="button"
              className={`ops-topbar-button ${stayMode ? "is-active" : ""}`}
              onClick={() => setStayMode((current) => !current)}
            >
              {stayMode ? "Stay in Dashboard: On" : "Stay in Dashboard: Off"}
            </button>
            <label className="ops-switch-select">
              <span>Switch Dashboard</span>
              <select
                value={selectedDashboard}
                onChange={(event) => {
                  const nextRoute = event.target.value;
                  if (!nextRoute) {
                    return;
                  }
                  navigate(nextRoute);
                }}
              >
                <option value="">Choose...</option>
                {navItems.map((item) => (
                  <option key={item.to} value={item.to}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="ops-status-strip">
            {statusItems.map((item) => (
              <div key={item.label} className="ops-status-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </header>

        <main className="ops-visual-stage">{children}</main>
      </div>

      <aside className="ops-right-panel">
        <section>
          <h2>Telemetry</h2>
          <div className="ops-telemetry-grid">
            {telemetry.map((item) => (
              <div key={item.label} className={`ops-telemetry-card ${toneClass(item.tone)}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Live Logs</h2>
          <div className="ops-log-stack">
            {logs.length === 0 ? (
              <p className="ops-muted">No live logs</p>
            ) : (
              logs.slice(0, 8).map((line) => <p key={line}>{line}</p>)
            )}
          </div>
        </section>
      </aside>
    </section>
  );
}
