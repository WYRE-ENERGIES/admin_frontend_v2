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
import { ConfigProvider } from 'antd';

function App() {
  const decodedUser = authHelper()
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const onBreakpoint = (broken) => {
    setCollapsed(broken);  // This ensures the sidebar collapses on smaller screens
  };

  return (
        <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#5c3592',
        },
      }}
    >
    <div className="App">
      <BrowserRouter>
      {
        decodedUser && decodedUser.client_type === "STANDARD" ?
        <div>
          {/* <AppHeader /> */}
          <div className="SidemenuAndPagecontent">
            <SideMenu
              trigger={null}
              collapsible
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              onBreakpoint={onBreakpoint}
            />
            <PageView />
          </div>
          {/* <AppFooter /> */}
        </div> :
        decodedUser && (decodedUser.client_type === "None" || decodedUser.client_type === "BULK_MONITORING") ?
        <div>
          {/* <AppHeader /> */}
          <div className="SidemenuAndPagecontent">
            <BulkSideMenu
              trigger={null}
              collapsible
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              onBreakpoint={onBreakpoint}
            />
            <BulkmonitoringPageView />
          </div>
          {/* <AppFooter /> */}
        </div> :
        <AuthRoute />
      }
      </BrowserRouter>
    </div>
      </ConfigProvider>
  );
}

export default App;
