import { Routes, Route, Navigate } from "react-router-dom";

import PortfolioOverview from "../../Pages/InvestorPages/PortfolioOverview";
import PlaceholderPage from "../../Pages/InvestorPages/PlaceholderPage";
import InvestorProjects from "../../Pages/InvestorPages/InvestorProjects";
import InvestorPayments from "../../Pages/InvestorPages/InvestorPayments";
import InvestorAccountKyc from "../../Pages/InvestorPages/InvestorAccountKyc";
import InvestorSupport from "../../Pages/InvestorPages/InvestorSupport";

function joinBase(basePath, path) {
  const base = String(basePath || "").replace(/\/+$/, "");
  const p = String(path || "");
  if (!base) return p || "/";
  if (!p || p === "/") return `${base}/`;
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
}

function InvestorRoute({ basePath = "" }) {
  return (
    <div className="investor-route-outlet">
      <Routes>
        <Route path={joinBase(basePath, "/")} element={<PortfolioOverview />} />
        <Route
          path={joinBase(basePath, "/projects")}
          element={<InvestorProjects />}
        />
        <Route
          path={joinBase(basePath, "/payments")}
          element={<InvestorPayments />}
        />
        <Route
          path={joinBase(basePath, "/reports")}
          element={<PlaceholderPage title="Reports" />}
        />
        <Route
          path={joinBase(basePath, "/account-kyc")}
          element={<InvestorAccountKyc />}
        />
        <Route
          path={joinBase(basePath, "/support")}
          element={<InvestorSupport />}
        />
        <Route path="*" element={<Navigate to={joinBase(basePath, "/")} replace />} />
      </Routes>
    </div>
  );
}

export default InvestorRoute;
