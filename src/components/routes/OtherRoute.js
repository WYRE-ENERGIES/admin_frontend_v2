import { Routes, Route } from "react-router-dom";
import LogOut from "../../Pages/OverviewPages/LogOut";
import ClientOverview from "../../Pages/OverviewPages/ClientOverview";
import CreateClient from "../../Pages/OverviewPages/CreateClient";
import ClientDetails from "../../Pages/OverviewPages/ClientDetails";
import DownloadPage from "../../Pages/AuthPages/DownloadPage";

function OtherRoute() {
  return (
    <>
    <div>
      <Routes>
        <Route exact path='/' element={<DownloadPage />} />
          <Route path="/clients" element={<ClientOverview />}></Route>
            <Route path="/clients" element={<ClientOverview />}></Route>
          <Route path="/create-client" element={<CreateClient />}></Route>
          <Route path="/client/:clientId" element={<ClientDetails />} />
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
