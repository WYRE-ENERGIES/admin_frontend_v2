import { Routes, Route, Navigate } from "react-router-dom";

import PortfolioOverview from "../../Pages/InvestorPages/PortfolioOverview";
import PlaceholderPage from "../../Pages/InvestorPages/PlaceholderPage";

function joinBase(basePath, path) {
  const base = String(basePath || "").replace(/\/+$/, "");
  const p = String(path || "");
  if (!base) return p || "/";
  if (!p || p === "/") return `${base}/`;
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
}

function InvestorRoute({ basePath = "" }) {
  return (
    <div>
      <Routes>
        <Route path={joinBase(basePath, "/")} element={<PortfolioOverview />} />
        <Route
          path={joinBase(basePath, "/projects")}
          element={<PlaceholderPage title="Projects" />}
        />
        <Route
          path={joinBase(basePath, "/payments")}
          element={<PlaceholderPage title="Payments" />}
        />
        <Route
          path={joinBase(basePath, "/reports")}
          element={<PlaceholderPage title="Reports" />}
        />
        <Route
          path={joinBase(basePath, "/account-kyc")}
          element={<PlaceholderPage title="Account & KYC" />}
        />
        <Route
          path={joinBase(basePath, "/support")}
          element={<PlaceholderPage title="Support" />}
        />
        <Route path="*" element={<Navigate to={joinBase(basePath, "/")} replace />} />
      </Routes>
    </div>
  );
}

export default InvestorRoute;
