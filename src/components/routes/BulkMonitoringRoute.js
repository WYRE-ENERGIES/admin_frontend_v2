import { Routes, Route } from "react-router-dom";
import AdminOverview from "../../Pages/OverviewPages/AdminOverview";
import ClientUsers from "../../Pages/OverviewPages/ClientUsers";
import SetClient from "../../Pages/OverviewPages/SetTarget";
import SetTarget from "../../Pages/OverviewPages/SetTarget";
import DieselOverview from "../../Pages/OverviewPages/DieselOverview";
import AuthRoute from "./AuthRoute";
import LogOut from "../../Pages/OverviewPages/LogOut";
import ViewLocations from "../../Pages/OverviewPages/ViewLocations";
import Support from "../../Pages/OverviewPages/support/Support";
import BranchDetails from "../../Pages/OverviewPages/BranchDetails";
import AdminPage from "../../Pages/BulkMonitoringPages/AdminPage";
import DevicesListPage from "../../Pages/BulkMonitoringPages/DevicesListPage";
import ClientOverview from "../../Pages/OverviewPages/ClientOverview";
import CreateClient from "../../Pages/OverviewPages/CreateClient";
import ForceLoginHandler from "../../Pages/AuthPages/ForceLoginHandler";
import DownloadPage from "../../Pages/AuthPages/DownloadPage";
import Settings from "../../Pages/OverviewPages/Settings";

function BulkMonitoringRoute() {
  return (
    <>
    <div>
      <Routes>
        <Route path="/" element={<AdminPage />}></Route>
        <Route path="/client-user" element={<ClientUsers />}></Route>
        <Route path="/set-target" element={<SetTarget />}></Route>
        <Route path="/devices-list" element={<DevicesListPage />}></Route>
        <Route path="/locations" element={<ViewLocations />}></Route>
        <Route path="/force-login" element={<ForceLoginHandler />}></Route>
        <Route path="/locations/branch" element={<BranchDetails />}></Route>
        <Route path="/settings" element={<Settings />}></Route>
        <Route path="/support" element={<Support />}></Route>
          <Route path="/branch" element={<BranchDetails />}></Route>
            <Route exact path='/download-csv' element={<DownloadPage />} />
      </Routes>
    </div>
    {/* <Routes>
        <Route path="/log-out" element={<AuthRoute />}></Route>
    </Routes> */}
    </>
  );
}
export default BulkMonitoringRoute;
