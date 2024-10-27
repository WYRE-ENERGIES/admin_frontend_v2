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

function OverviewRoute() {
  return (
    <>
    <div>
      <Routes>
        <Route path="/" element={<AdminOverview />}></Route>
        <Route path="/client-user" element={<ClientUsers />}></Route>
        <Route path="/set-target" element={<SetTarget />}></Route>
        <Route path="/diesel" element={<DieselOverview />}></Route>
        <Route path="/locations" element={<ViewLocations />}></Route>
        <Route path="/log-out" element={<LogOut />}></Route>
        <Route path="/support" element={<Support />}></Route>
      </Routes>
    </div>
    {/* <Routes>
        <Route path="/log-out" element={<AuthRoute />}></Route>
    </Routes> */}
    </>
  );
}
export default OverviewRoute;
