import Layout from "./Layout.jsx";

import Home from "./Home";
import OnboardingNew from "./OnboardingNew";
import Perihelion from "./Perihelion";
import ProfileSettings from "./ProfileSettings";
import Session from "./Session";
import Welcome from "./Welcome";

import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";

// Canonical lowercase route map (what we standardize on)
const ROUTE_ALIASES = {
  home: "/",
  welcome: "/welcome",
  onboardingnew: "/onboarding",
  onboarding: "/onboarding",
  perihelion: "/perihelion",
  profilesettings: "/profile",
  session: "/session",
};

function getCanonicalPath(pathname) {
  const clean = pathname.replace(/\/+$/, "");
  const last = (clean.split("/").pop() || "").split("?")[0].toLowerCase();
  return ROUTE_ALIASES[last] || pathname;
}

function PagesContent() {
  const location = useLocation();
  const canonical = getCanonicalPath(location.pathname);

  // Redirect old Base44/TitleCase routes to canonical
  if (canonical !== location.pathname) {
    return <Navigate to={canonical} replace />;
  }

  const currentPage =
    Object.entries(ROUTE_ALIASES).find(([, p]) => p === location.pathname)?.[0] || "home";

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        {/* Canonical routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<OnboardingNew />} />
        <Route path="/perihelion" element={<Perihelion />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/session" element={<Session />} />

        {/* Legacy routes (kept temporarily) */}
        <Route path="/Home" element={<Navigate to="/" replace />} />
        <Route path="/Welcome" element={<Navigate to="/welcome" replace />} />
        <Route path="/OnboardingNew" element={<Navigate to="/onboarding" replace />} />
        <Route path="/Onboarding" element={<Navigate to="/onboarding" replace />} />
        <Route path="/Perihelion" element={<Navigate to="/perihelion" replace />} />
        <Route path="/ProfileSettings" element={<Navigate to="/profile" replace />} />
        <Route path="/Session" element={<Navigate to="/session" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
