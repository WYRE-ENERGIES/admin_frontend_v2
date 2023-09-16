import { Routes, Route } from "react-router-dom";
import AdminOverview from "../../Pages/OverviewPages/AdminOverview";
import ClientUsers from "../../Pages/OverviewPages/ClientUsers";

function OverviewRoute() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<AdminOverview />}></Route>
          <Route path="/client-user" element={<ClientUsers />}></Route>
          {/* <Route path="/view-location" element={<ViewLocation />}></Route> */}
          {/* <Route path="/set-target" element={<SetTarget />}></Route> */}
        </Routes>
    </div>
  );
}
export default OverviewRoute;
