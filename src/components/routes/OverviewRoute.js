import { Routes, Route } from "react-router-dom";
import AdminOverview from "../../Pages/OverviewPages/AdminOverview";
import ClientUsers from "../../Pages/OverviewPages/ClientUsers";
import SetClient from "../../Pages/OverviewPages/SetTarget";
import SetTarget from "../../Pages/OverviewPages/SetTarget";
import DieselOverview from "../../Pages/OverviewPages/DieselOverview";

function OverviewRoute() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<AdminOverview />}></Route>
          <Route path="/client-user" element={<ClientUsers />}></Route>
          <Route path="/set-target" element={<SetTarget />}></Route>
          <Route path="/diesel" element={<DieselOverview />}></Route>
          {/* <Route path="/set-target" element={<SetTarget />}></Route> */}
        </Routes>
    </div>
  );
}
export default OverviewRoute;
