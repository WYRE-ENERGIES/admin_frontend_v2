// function SideMenu() {
//     return (
//       <div className="SideMenu">
//         <sidebar>Side Menu</sidebar>
//       </div>
//     );
//   }
  
//   export default SideMenu;


import {
    EnvironmentOutlined,
    UserOutlined,
    ProjectOutlined,
    MenuOutlined,
    HeatMapOutlined,
    LoginOutlined,
    MailOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { Button, Image, Menu, theme, Drawer, Space } from "antd";
import Sider from "antd/es/layout/Sider";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/actions/auth/auth.creator";
import DownloadPage from "../../Pages/AuthPages/DownloadPage";

function OtherSideMenu({ collapsed, setCollapsed }) {
    const [selectedLocation, setSelectedLocation] = useState('/');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
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
        dispatch(logoutUser());
        window.localStorage.removeItem('loggedWyreUserAdmin');
        window.location.href = '/';
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
            type: 'divider',
        },
        {
            label: "Log out",
            key: '/log-out',
            onClick: logOut,
            icon: <LoginOutlined style={{ scale: collapsed ? '1.1' : '1' }} />,
        },
        {
            type: 'divider',
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
                    if (key === '/log-out') {
                        logOut();
                    } else {
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
                <Image
                    width={73}
                    height={38}
                    preview={false}
                    style={{ padding: 0 }}
                    src="/Images/atc.png"
                    alt='ATC Logo'
                />
                <p style={{
                    fontSize: '12px',
                    display: collapsed ? 'none' : 'block',
                    color: 'white'
                }}>ATC</p>
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

export default OtherSideMenu;
    
    