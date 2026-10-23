import { Routes, Route } from "react-router-dom";
import AdminOverview from "../../Pages/OverviewPages/AdminOverview";
import ClientUsers from "../../Pages/OverviewPages/ClientUsers";
import SetTarget from "../../Pages/OverviewPages/SetTarget";
import DieselOverview from "../../Pages/OverviewPages/DieselOverview";
import ViewLocations from "../../Pages/OverviewPages/ViewLocations";
import Support from "../../Pages/OverviewPages/support/Support";
import ForceLoginAdminHandler from "../../Pages/AuthPages/ForceLoginAdminHandler";
import BranchDetails from "../../Pages/OverviewPages/BranchDetails";
import Settings from "../../Pages/OverviewPages/Settings";
import SolarOverview from "../../Pages/OverviewPages/SolarOverview";

function OverviewRoute() {
  return (
    <>
    <div>
      <Routes>
        <Route path="/" element={<AdminOverview />}></Route>
          <Route path="/client-user" element={<ClientUsers />}></Route>
          <Route path='/force-login-admin' element={<ForceLoginAdminHandler />} />
        <Route path="/set-target" element={<SetTarget />}></Route>
        <Route path="/diesel" element={<DieselOverview />}></Route>
        <Route path="/solar-overview" element={<SolarOverview />}></Route>
        <Route path="/locations" element={<ViewLocations />}></Route>
        <Route path="/locations/branch" element={<BranchDetails />}></Route>
        <Route path="/settings" element={<Settings />}></Route>
        <Route path="/support" element={<Support />}></Route>
        <Route path="/branch" element={<BranchDetails />}></Route>
      </Routes>
    </div>
    {/* <Routes>
        <Route path="/log-out" element={<AuthRoute />}></Route>
    </Routes> */}
    </>
  );
}
export default OverviewRoute;
