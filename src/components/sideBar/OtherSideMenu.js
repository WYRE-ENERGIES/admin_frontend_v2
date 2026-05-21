import {
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  WarningOutlined,
  LoginOutlined,
  DownloadOutlined,
  SettingOutlined,
  HolderOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Button, Image, Menu, Drawer } from "antd";
import Sider from "antd/es/layout/Sider";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { logUserOut } from "../../redux/actions/auth/auth.action";
import EnvData from "../../config/EnvData";
import authHelper from "../../helpers/authHelper";

function OtherSideMenu({ collapsed, setCollapsed, logUserOut }) {
  const [selectedLocation, setSelectedLocation] = useState('/');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [clientLogo, setClientLogo] = useState(null);
  const [clientName, setClientName] = useState(null);
  const location = useLocation();
  const decoded = authHelper();
  const isSuperAdmin = String(decoded?.role_text || "").toUpperCase() === "SUPERADMIN";

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setClientLogo(currentUser.client_image);
    setClientName(currentUser.client);
  }, []);

  const navigate = useNavigate();

  // Responsive: handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileDrawerOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSelectedLocation(location.pathname);
  }, [location.pathname]);

  const logOut = () => {
    logUserOut();
  };

  const items = [
    {
      label: "Download CSV",
      key: "/",
      icon: <DownloadOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
    },
    {
      label: "Clients",
      key: "/clients",
      icon: <UserOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
    },
    {
      label: "Historical Readings",
      key: "/historical-readings",
      icon: <WarningOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
    },
    {
      label: "Solar Onboarding",
      key: "/solar-onboarding",
      icon: <ThunderboltOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
    },
    {
      label: "Solar Management",
      key: "/solar-management",
      icon: <SunOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
    },
    {
      label: "Installations",
      key: "/installations-checklist",
      icon: <SafetyCertificateOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
    },
    {
      label: "System",
      key: "/system-constants",
      icon: <HolderOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
    },
    ...(isSuperAdmin
      ? [
        {
          label: "Investors Mgt",
          key: "/investors-mgt",
          icon: <TeamOutlined style={{ scale: collapsed ? "1.1" : "1" }} />,
        },
      ]
      : []),
    {
      type: 'divider',
    },
    {
      label: "Settings",
      key: "/settings",
      icon: <SettingOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
    },
    {
      type: 'divider',
    },
    {
      label: "Log Out",
      key: "logout",
      icon: <LoginOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
      onClick: logOut,
    },
  ];

  // Menu content for both desktop and mobile
  const MenuContent = () => (
    <>
      <div className="wyre-logo" style={{ textAlign: 'center' }}>
        <Image width={80} preview={false} src="/Images/Wyre white-08 1.png" />
        {!isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: "white" }} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginLeft: 10, color: "white" }}
          />
        )}
      </div>
      <Menu
        className="SideMenuVertical"
        theme="white"
        selectedKeys={[selectedLocation]}
        onClick={({ key }) => {
          if (key === '/log-out')
          {
            logOut();
          } else
          {
            navigate(key);
            if (isMobile) setMobileDrawerOpen(false);
          }
        }}
        mode="vertical"
        items={items}
      />
      <div
        className="SideMenuVertical"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
          width: '100%',
          padding: 0,
          gap: '20px',
          marginTop: '20px'
        }}>
        <img
          width={73}
          height={38}
          style={{ padding: 0, objectFit: 'contain' }}
          src={EnvData.REACT_APP_API_URL + clientLogo || '/images/wyre-placeholder-logo.png'}
          alt='Client Logo'
          preview={false}
        />
        <p style={{
          fontSize: '12px',
          display: collapsed ? 'none' : 'block',
          color: 'white'
        }}>{clientName || '---'}</p>
      </div>
    </>
  );

  // Mobile header
  const MobileHeader = () => (
    <div className="mobile-header" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '5px',
      backgroundColor: '#5C12A7',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <Image width={80} src="/Images/Wyre white-08 1.png" />
      <Button
        type="text"
        icon={<MenuOutlined style={{ color: "white" }} />}
        onClick={() => setMobileDrawerOpen(true)}
        style={{ color: "white" }}
      />
    </div>
  );

  // Render mobile drawer if mobile
  if (isMobile)
  {
    return (
      <>
        <MobileHeader />
        <Drawer
          placement="right"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          width={280}
          bodyStyle={{ padding: 0, backgroundColor: "#5C12A7" }}
          headerStyle={{ display: 'none' }}
        >
          <MenuContent />
        </Drawer>
      </>
    );
  }

  // Render desktop sidebar
  return (
    <Sider
      style={{
        height: "100vh",
        position: "sticky",

        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        color: "white",
        marginLeft: 15
      }}
      collapsible
      collapsed={collapsed}
      collapsedWidth={60}
      trigger={null}
      onCollapse={(value) => setCollapsed(value)}
    >
      <MenuContent />
    </Sider>
  );
}

export default connect(null, { logUserOut })(OtherSideMenu);

