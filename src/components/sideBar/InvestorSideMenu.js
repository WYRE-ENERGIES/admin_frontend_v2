import {
  PieChartOutlined,
  ProjectOutlined,
  DollarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  CustomerServiceOutlined,
  MenuOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Image, Menu, Drawer } from "antd";
import Sider from "antd/es/layout/Sider";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { logUserOut } from "../../redux/actions/auth/auth.action";

function joinBase(basePath, path) {
  const base = String(basePath || "").replace(/\/+$/, "");
  const p = String(path || "");
  if (!base) return p || "/";
  if (!p || p === "/") return `${base}/`;
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
}

function initialsFromUser(u) {
  const first = (u?.first_name || "").trim();
  const last = (u?.last_name || "").trim();
  if (first || last) {
    if (first && !last) return first.slice(0, 2).toUpperCase() || first.charAt(0).toUpperCase();
    const a = first.charAt(0) || "";
    const b = last.charAt(0) || first.charAt(1) || "";
    return (a + b).toUpperCase() || "?";
  }
  const un = (u?.username || u?.email || "").trim();
  if (un.length >= 2) return un.slice(0, 2).toUpperCase();
  if (un.length === 1) return un.toUpperCase();
  return "IN";
}

function displayNameFromUser(u) {
  const full = `${u?.first_name || ""} ${u?.last_name || ""}`.trim();
  if (full) return full;
  if (u?.username) return u.username;
  if (u?.email) return u.email.split("@")[0];
  return "Investor";
}

function InvestorSideMenu({ collapsed, setCollapsed, logUserOut, basePath = "" }) {
  const [selectedLocation, setSelectedLocation] = useState("/");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileUser, setProfileUser] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const isPreviewRoute = location.pathname.startsWith("/__investor_preview");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSelectedLocation(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser");
      setProfileUser(raw ? JSON.parse(raw) : {});
    } catch {
      setProfileUser({});
    }
  }, [location.pathname]);

  const profile = useMemo(() => {
    const u = profileUser || {};
    const name = isPreviewRoute && !u.username && !u.first_name
      ? "Jane D."
      : displayNameFromUser(u);
    const initials = isPreviewRoute && !u.username && !u.first_name
      ? "JD"
      : initialsFromUser(u);
    const roleLine =
      String(u.role_text || "").toUpperCase() === "INVESTOR"
        ? "Verified Investor"
        : u.role_text
          ? String(u.role_text).replace(/_/g, " ")
          : "Verified Investor";
    return { name, initials, roleLine };
  }, [profileUser, isPreviewRoute]);

  const logOut = () => {
    logUserOut();
  };

  const items = [
    {
      label: "Portfolio",
      key: joinBase(basePath, "/"),
      icon: <PieChartOutlined style={{ scale: collapsed ? "1.1" : "1" }} />,
    },
    {
      label: "Projects",
      key: joinBase(basePath, "/projects"),
      icon: <ProjectOutlined style={{ scale: collapsed ? "1.1" : "1" }} />,
    },
    {
      label: "Payments",
      key: joinBase(basePath, "/payments"),
      icon: <DollarOutlined style={{ scale: collapsed ? "1.1" : "1" }} />,
    },
    {
      label: "Reports",
      key: joinBase(basePath, "/reports"),
      icon: <FileTextOutlined style={{ scale: collapsed ? "1.1" : "1" }} />,
    },
    {
      type: "divider",
    },
    {
      label: "Account & KYC",
      key: joinBase(basePath, "/account-kyc"),
      icon: <IdcardOutlined style={{ scale: collapsed ? "1.1" : "1" }} />,
    },
    {
      label: "Support",
      key: joinBase(basePath, "/support"),
      icon: <CustomerServiceOutlined style={{ scale: collapsed ? "1.1" : "1" }} />,
    },
    {
      type: "divider",
    },
    {
      label: "Log Out",
      key: "logout",
      icon: <LoginOutlined style={{ scale: collapsed ? "1.1" : "1" }} />,
      onClick: logOut,
    },
  ];

  const MenuContent = () => (
    <div className="investor-sider-inner">
      <div className="investor-sider-top">
        <div className="wyre-logo investor-sider-brand" style={{ textAlign: "center" }}>
          <Image width={80} preview={false} src="/Images/Wyre white-08 1.png" />
          {!collapsed && (
            <div className="investor-sider-role-pill">Investor</div>
          )}
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
          className="SideMenuVertical investor-sider-menu"
          theme="white"
          selectedKeys={[selectedLocation]}
          onClick={({ key }) => {
            if (key === "logout") {
              logOut();
              return;
            }
            navigate(key);
            if (isMobile) setMobileDrawerOpen(false);
          }}
          mode="vertical"
          items={items}
        />
      </div>
      <div
        className={`investor-sidebar-profile${collapsed && !isMobile ? " investor-sidebar-profile--collapsed" : ""}`}
      >
        <Avatar
          size={collapsed && !isMobile ? 36 : 44}
          className="investor-sidebar-avatar"
        >
          {profile.initials}
        </Avatar>
        {(!collapsed || isMobile) && (
          <div className="investor-sidebar-profile-text">
            <div className="investor-sidebar-profile-name">{profile.name}</div>
            <div className="investor-sidebar-profile-role">{profile.roleLine}</div>
          </div>
        )}
      </div>
    </div>
  );

  const MobileHeader = () => (
    <div
      className="mobile-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "5px",
        backgroundColor: "#5C12A7",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Image width={80} src="/Images/Wyre white-08 1.png" />
      <Button
        type="text"
        icon={<MenuOutlined style={{ color: "white" }} />}
        onClick={() => setMobileDrawerOpen(true)}
        style={{ color: "white" }}
      />
    </div>
  );

  if (isMobile) {
    return (
      <>
        <MobileHeader />
        <Drawer
          placement="right"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          width={280}
          bodyStyle={{ padding: 0, backgroundColor: "#5C12A7" }}
          headerStyle={{ display: "none" }}
        >
          <MenuContent />
        </Drawer>
      </>
    );
  }

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
        marginLeft: 15,
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

export default connect(null, { logUserOut })(InvestorSideMenu);

