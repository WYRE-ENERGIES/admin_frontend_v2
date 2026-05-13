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
import HistoricalReadings from "../../Pages/OverviewPages/HistoricalReadings";
import SolarOnboarding from "../../Pages/OverviewPages/SolarOnboarding";
import SolarStationDetails from "../../Pages/OverviewPages/SolarStationDetails";
import SolarManagement from "../../Pages/OverviewPages/SolarMgt";
import InstallationsChecklist from "../../Pages/OverviewPages/InstallationsChecklist";

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
          <Route path="/solar-onboarding" element={<SolarOnboarding />} />
          <Route path="/solar-onboarding/stations/:branchId" element={<SolarStationDetails />} />
          <Route path="/solar-management" element={<SolarManagement />} />
          <Route path="/installations-checklist" element={<InstallationsChecklist />} />
          <Route path="/settings" element={<Settings />}></Route>
          <Route path="/historical-readings" element={<HistoricalReadings />}></Route>
          <Route path="/log-out" element={<LogOut />}></Route>
        </Routes>
      </div>
    </>
  );
}
export default OtherRoute;
