import { Routes, Route } from "react-router-dom";
import LogOut from "../../Pages/OverviewPages/LogOut";
import DownloadPage from "../../Pages/AuthPages/DownloadPage";
import Settings from "../../Pages/OverviewPages/Settings";
import SystemConstants from "../../Pages/OverviewPages/SystemContants";
import Anomalies from "../../Pages/OverviewPages/Anomalies";
import Documentation from "../../Pages/OverviewPages/Documentation";

function OperatorsRoute() {
  return (
    <>
      <div>
        <Routes>
          <Route exact path='/' element={<DownloadPage />} />
          <Route path="/system-constants" element={<SystemConstants />}></Route>
          <Route path="/settings" element={<Settings />}></Route>
          <Route path="/anomalies" element={<Anomalies />}></Route>
          <Route path="/documentation" element={<Documentation />}></Route>
          <Route path="/log-out" element={<LogOut />}></Route>
        </Routes>
      </div>
    </>
  );
}
export default OperatorsRoute;
