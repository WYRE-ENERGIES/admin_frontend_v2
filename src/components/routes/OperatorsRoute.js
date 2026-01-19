import { Routes, Route } from "react-router-dom";
import LogOut from "../../Pages/OverviewPages/LogOut";
import DownloadPage from "../../Pages/AuthPages/DownloadPage";
import Settings from "../../Pages/OverviewPages/Settings";
import SystemConstants from "../../Pages/OverviewPages/SystemContants";
import HistoricalReadings from "../../Pages/OverviewPages/HistoricalReadings";
import Documentation from "../../Pages/OverviewPages/Documentation";

function OperatorsRoute() {
  return (
    <>
      <div>
        <Routes>
          <Route exact path='/' element={<DownloadPage />} />
          <Route path="/system-constants" element={<SystemConstants />}></Route>
          <Route path="/settings" element={<Settings />}></Route>
          <Route path="/historical-readings" element={<HistoricalReadings />}></Route>
          <Route path="/documentation" element={<Documentation />}></Route>
          <Route path="/log-out" element={<LogOut />}></Route>
        </Routes>
      </div>
    </>
  );
}
export default OperatorsRoute;
