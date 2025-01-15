import { BrowserRouter } from 'react-router-dom';
import './App.css';
import PageView from './components/pageContent/PageViews/PageView';
import SideMenu from './components/sideBar/SideMenu';
import Login from './Pages/AuthPages/Login';
import authHelper from './helpers/authHelper';
import { theme } from 'antd';
import { useState } from 'react';
import AuthRoute from './components/routes/AuthRoute';
import BulkSideMenu from './components/sideBar/BulkSideMenu';
import BulkmonitoringPageView from './components/pageContent/PageViews/BulkmonitoringPageView';

function App() {
  const decodedUser = authHelper()
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const doColapse = () => {
  }
  // setCollapsed(collapsed)
  return (
    <div className="App">
      <BrowserRouter>
      {
        decodedUser && decodedUser.client_type === "STANDARD" ?
        <div>
          {/* <AppHeader /> */}
          <div className="SidemenuAndPagecontent">
            <SideMenu trigger={null} collapsible collapsed={collapsed} doColapse={doColapse} setCollapsed={setCollapsed}  />
            <PageView />
          </div>
          {/* <AppFooter /> */}
        </div> :
        decodedUser && decodedUser.client_type === "BULK_MONITORING" ?
        <div>
          {/* <AppHeader /> */}
          <div className="SidemenuAndPagecontent">
            <BulkSideMenu trigger={null} collapsible collapsed={collapsed} doColapse={doColapse} setCollapsed={setCollapsed}  />
            <BulkmonitoringPageView />
          </div>
          {/* <AppFooter /> */}
        </div> :
        <AuthRoute />
      }
      </BrowserRouter>
    </div>
  );
}

export default App;
