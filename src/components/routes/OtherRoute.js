import { Routes, Route } from "react-router-dom";
import LogOut from "../../Pages/OverviewPages/LogOut";
import ClientOverview from "../../Pages/OverviewPages/ClientOverview";
import ForceLoginHandler from "../../Pages/AuthPages/ForceLoginHandler";
import ForceLoginAdminHandler from "../../Pages/AuthPages/ForceLoginAdminHandler";
import CreateClient from "../../Pages/OverviewPages/CreateClient";
import ClientDetails from "../../Pages/OverviewPages/ClientDetails";
import DownloadPage from "../../Pages/AuthPages/DownloadPage";
import Settings from "../../Pages/OverviewPages/Settings";
import SystemConstants from "../../Pages/OverviewPages/SystemContants";
import Anomalies from "../../Pages/OverviewPages/Anomalies";

function OtherRoute() {
  return (
    <>
      <div>
        <Routes>
          <Route exact path='/' element={<DownloadPage />} />
          <Route path="/clients" element={<ClientOverview />}></Route>
          <Route path="/force-login" element={<ForceLoginHandler />}></Route>
          <Route path='/force-login-admin' element={<ForceLoginAdminHandler />} />
          <Route path="/clients" element={<ClientOverview />}></Route>
          <Route path="/create-client" element={<CreateClient />}></Route>
          <Route path="/system-constants" element={<SystemConstants />}></Route>
          <Route path="/client/:clientId" element={<ClientDetails />} />
          <Route path="/settings" element={<Settings />}></Route>
          <Route path="/anomalies" element={<Anomalies />}></Route>
          <Route path="/log-out" element={<LogOut />}></Route>
        </Routes>
      </div>
      {/* <Routes>
        <Route path="/log-out" element={<AuthRoute />}></Route>
    </Routes> */}
    </>
  );
}
export default OtherRoute;
