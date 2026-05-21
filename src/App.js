import { BrowserRouter, useLocation } from 'react-router-dom';
import './App.css';
import PageView from './components/pageContent/PageViews/PageView';
import SideMenu from './components/sideBar/SideMenu';
import Login from './Pages/AuthPages/Login';
import authHelper from './helpers/authHelper';
import { theme } from 'antd';
import { useEffect, useState } from 'react';
import AuthRoute from './components/routes/AuthRoute';
import BulkSideMenu from './components/sideBar/BulkSideMenu';
import BulkmonitoringPageView from './components/pageContent/PageViews/BulkmonitoringPageView';
import { ConfigProvider } from 'antd';
import OtherSideMenu from "./components/sideBar/OtherSideMenu";
import OtherPageView from "./components/pageContent/PageViews/OtherPageView";
import OperatorsSideMenu from "./components/sideBar/OperatorsSideMenu";
import OperatorsPageView from "./components/pageContent/PageViews/OperatorsPageVeiw";
import InvestorSideMenu from "./components/sideBar/InvestorSideMenu";
import InvestorPageView from "./components/pageContent/PageViews/InvestorPageView";

function AppContent() {
  const location = useLocation();
  const decodedUser = authHelper();
  const [collapsed, setCollapsed] = useState(false);

  const onBreakpoint = (broken) => {
    setCollapsed(broken); // This ensures the sidebar collapses on smaller screens
  };

  const investorPreviewBasePath = "/__investor_preview";
  const isInvestorPreview = location.pathname.startsWith(investorPreviewBasePath);

  const isInvestor = (() => {
    if (!decodedUser) return false;
    const roleText = decodedUser.role_text;
    if (roleText && String(roleText).toUpperCase() === "INVESTOR") return true;

    // Fallback for older tokens/environments (backend role int not known yet)
    const maybeRole = decodedUser.user_type || decodedUser.userRole;
    return String(maybeRole || "").toLowerCase() === "investor";
  })();

  const showInvestorShell = isInvestorPreview || Boolean(decodedUser && isInvestor);

  useEffect(() => {
    if (showInvestorShell) {
      document.body.classList.add("wyre-investor-app");
    } else {
      document.body.classList.remove("wyre-investor-app");
    }
    return () => document.body.classList.remove("wyre-investor-app");
  }, [showInvestorShell]);

  if (isInvestorPreview) {
    return (
      <div className="wyre-app-layout">
        <div className="SidemenuAndPagecontent investor-layout">
        <InvestorSideMenu
          trigger={null}
          collapsible
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onBreakpoint={onBreakpoint}
          basePath={investorPreviewBasePath}
        />
        <InvestorPageView basePath={investorPreviewBasePath} />
        </div>
      </div>
    );
  }

  return decodedUser && isInvestor ? (
    <div className="wyre-app-layout">
      <div className="SidemenuAndPagecontent investor-layout">
      <InvestorSideMenu
        trigger={null}
        collapsible
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onBreakpoint={onBreakpoint}
      />
      <InvestorPageView />
      </div>
    </div>
  ) : decodedUser && decodedUser.client_type === "STANDARD" ? (
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
    </div>
  ) : decodedUser && decodedUser.client_type === "BULK_MONITORING" ? (
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
    </div>
  ) : decodedUser && decodedUser.client_type === "WYRE" && decodedUser.role_text === "OPERATOR" ? (
    <div>
      <div className="SidemenuAndPagecontent">
        <OperatorsSideMenu
          trigger={null}
          collapsible
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onBreakpoint={onBreakpoint}
        />
        <OperatorsPageView />
      </div>
    </div>
  ) : decodedUser && decodedUser.client_type === "WYRE" ? (
    <div>
      {/* <AppHeader /> */}
      <div className="SidemenuAndPagecontent">
        <OtherSideMenu
          trigger={null}
          collapsible
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onBreakpoint={onBreakpoint}
        />
        <OtherPageView />
      </div>
      {/* <AppFooter /> */}
    </div>
  ) : (
    <AuthRoute />
  );
}

function App() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
          <AppContent />
        </BrowserRouter>
      </div>
    </ConfigProvider>
  );
}

export default App;
