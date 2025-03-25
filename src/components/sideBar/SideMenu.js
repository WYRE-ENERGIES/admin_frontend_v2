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
  CompassOutlined,
  DashboardOutlined,
  AimOutlined,
  HeatMapOutlined,
  LoginOutlined,
  SendOutlined,
  MessageOutlined,
  MailOutlined,
  CustomerServiceOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Button, Image, Menu, Space, theme } from "antd";
import Form from "antd/es/form/Form";
import Sider from "antd/es/layout/Sider";
import useToken from "antd/es/theme/useToken";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logUserOut } from "../../redux/actions/auth/auth.action";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/actions/auth/auth.creator";
  
function SideMenu({collapsed, setCollapsed}) {
    const [selectedLocation, setSelectedLocation] = useState('/')
    const location = useLocation()
    const {
      token: { colorBgContainer },
    } = theme.useToken();
    const dispatch = useDispatch
    const onLogout = () => {
      const navigateTo = '/'
      dispatch(logoutUser())
      navigate(navigateTo)
    }
    const logOut = () => {
      dispatch(logoutUser());
      window.localStorage.removeItem('loggedWyreUserAdmin');
      window.location.href = '/';
    };
    
    const items = [
      {
        label: "Admin Overview",
        key: "/",
        icon: <ProjectOutlined style={{scale: collapsed ? '1.1' : '1'}} />,
      },
      {
        label: "Users",
        key: "/client-user",
        icon: <UserOutlined style={{scale: collapsed ? '1.1' : '1'}} />,
      },
      {
        label: "View Location",
        key: "/locations",
        icon: <EnvironmentOutlined style={{scale: collapsed ? '1.1' : '1'}} />,
      },
      {
        label: "Set Target",
        key: "/set-target",
        icon: <AimOutlined style={{scale: collapsed ? '1.1' : '1'}} />,
      },
      {
        label: "Diesel Overview",
        key: "/diesel",
        icon: <HeatMapOutlined style={{scale: collapsed ? '1.1' : '1'}} />,
      },
      // {
      //   label: "Regions Activities",
      //   key: "/regions-activities",
      //   icon: <CompassOutlined />,
      // },
      // {
      //   label: "Top Management Report",
      //   key: "/top-mngt",
      //   icon: <SendOutlined />,
      // },
      {
        type: 'divider',
      },
      {
        label: "Log out",
        key: '/log-out',
        // key: {onclick:() => logOut()},
        onclick:{logOut},
        icon: <LoginOutlined style={{scale: collapsed ? '1.1' : '1'}} />,
      },
      {
        label: "Support",
        key: "/support",
        icon: <MailOutlined style={{scale: collapsed ? '1.1' : '1'}} />,
      },
      {
        type: 'divider',
      },
    ]
  
    useEffect( () => {
      const pathName = location.pathname
      setSelectedLocation(pathName)
    }, [location.pathname])
  
    const navigate = useNavigate()
    return (
      <Sider
        // className="SideMenu"
        style={{
          // overflow: 'auto',
          height: "100vh",
          // position: "fixed",
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
        <div className="wyre-logo">
            <Image width={80} src="/Images/Wyre white-08 1.png"></Image>
            <Button
              type="text"
              icon={
                collapsed ? (
                  <MenuOutlined style={{ color: "white" }} />
                ) : (
                  // <MenuFoldOutlined style={{ color: "white" }} />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    {/* <Image width={80} src="/Images/Wyre white-08 1.png"></Image> */}
                    <Button
                      type="text"
                      icon={
                        collapsed ? (
                          <MenuOutlined style={{ color: "white" }} />
                        ) : (
                          <MenuOutlined style={{ marginLeft: 0, color: "white" }} />
                        )
                      }
                      onClick={() => {
                        setCollapsed(!collapsed);
                      }}
                    />
                  </div>
                )
              }
              onClick={() => {
                setCollapsed(!collapsed);
              }}
            style={{
              marginLeft: '5px',
              scale: collapsed ? '1.1' : '1',
                width: 52,
                // height: 64,
              }}
            />
        </div>
        <Menu
          className="SideMenuVertical"
          theme="white"
          defaultSelectedKeys={["1"]}
          onClick={(Item) => {
            navigate(Item.key);
          }}
          mode="vertical"
          items={items}
        />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
          width: '100%',
            padding: 0,
            marginTop: '20px'
          }}>
            <Image
            width={73}
            height={38}
            style={{
            padding: 0,
              // paddingTop: '5px'
            }}
            // preview={null}
            // src="/Images/Group 1688.png"
            src={require('../../Logos/polaris-logo/polarisSvg.svg').default} alt='Clients Logo'
          />
          <p style={{
            fontSize: '12px',
            display: collapsed ? 'none' : 'block',
            color: 'white'
          }}>Polaris Bank</p>
          </div>
      </Sider>
    );
  }
  
  export default SideMenu;
  
  