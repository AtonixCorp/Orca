/**
 * ============================================================================
 * File: webapp/src/App.tsx
 * Purpose:
 *   Top-level component. Owns the route table and the persistent shell
 *   (header, navigation). Keep this file small — routes pull in their own
 *   page components from `src/pages`.
 * ============================================================================
 */

import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Architecture from "./pages/Architecture";
import CityMapPage from "./pages/CityMapPage";
import Community from "./pages/Community";
import DroneVisualizationPage from "./pages/DroneVisualizationPage";
import Mission from "./pages/Mission";
import MissionControlPage from "./pages/MissionControlPage";
import NotFound from "./pages/NotFound";
import RoboticsVisualizationPage from "./pages/RoboticsVisualizationPage";
import IndividualizationPage from "./pages/IndividualizationPage";
import NavigationHubPage from "./pages/NavigationHubPage";
import Roadmap from "./pages/Roadmap";
import Visualization from "./pages/Visualization";

export default function App() {
  const location = useLocation();
  const isCommandCenterRoute = location.pathname === "/hub" || location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/");

  return (
    <div className={isCommandCenterRoute ? "app-shell app-shell-dashboard" : "app-shell"}>
      {!isCommandCenterRoute ? (
        <header className="app-header">
          <h1 className="app-title">Orca</h1>
          <nav className="app-nav">
            <Link to="/home">Home</Link>
            <Link to="/mission">Mission</Link>
            <Link to="/architecture">Architecture</Link>
            <Link to="/community">Community</Link>
            <Link to="/roadmap">Roadmap</Link>
            <Link to="/hub">Dashboard</Link>
            <Link to="/visualization">Visualization</Link>
          </nav>
        </header>
      ) : null}

      <main className={isCommandCenterRoute ? "app-main app-main-dashboard" : "app-main"}>
        <Routes>
          <Route path="/" element={<Navigate to="/hub" replace />} />
          <Route path="/hub" element={<NavigationHubPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/community" element={<Community />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/dashboard" element={<Navigate to="/hub" replace />} />
          <Route path="/dashboard/robot" element={<RoboticsVisualizationPage />} />
          <Route path="/dashboard/drone" element={<DroneVisualizationPage />} />
          <Route path="/dashboard/city" element={<CityMapPage />} />
          <Route path="/dashboard/mission" element={<MissionControlPage />} />
          <Route path="/dashboard/individualization" element={<IndividualizationPage />} />
          <Route path="/dashboard/robotics" element={<Navigate to="/dashboard/robot" replace />} />
          <Route path="/dashboard/city-view" element={<Navigate to="/dashboard/city" replace />} />
          <Route path="/dashboard/cityview" element={<Navigate to="/dashboard/city" replace />} />
          <Route path="/dashboard/cityview/" element={<Navigate to="/dashboard/city" replace />} />
          <Route path="/visualization" element={<Visualization />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isCommandCenterRoute ? (
        <footer className="app-footer">
          <small>
            Orca · Urban Data Backbone · Apache 2.0 ·{" "}
            <a
              href="https://github.com/atonixdev/orca"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </small>
        </footer>
      ) : null}
    </div>
  );
}
