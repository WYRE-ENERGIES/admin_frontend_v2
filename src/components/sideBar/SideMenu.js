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
      console.log('Loging-out in first line ========' );
      dispatch(logoutUser());
      console.log('Loging-out in dispatch ========' );
      window.localStorage.removeItem('loggedWyreUserAdmin');
      console.log('Loging-out 333 ========' );
      window.location.href = '/';
      console.log('Loging-out 4444 ========' );
    };
    
    const items = [
      {
        label: "Admin Overview",
        key: "/",
        icon: <ProjectOutlined />,
      },
      {
        label: "Users",
        key: "/client-user",
        icon: <UserOutlined />,
      },
      {
        label: "View Location",
        key: "/locations",
        icon: <EnvironmentOutlined />,
      },
      {
        label: "Set Target",
        key: "/set-target",
        icon: <AimOutlined />,
      },
      {
        label: "Diesel Overview",
        key: "/diesel",
        icon: <HeatMapOutlined />,
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
        icon: <LoginOutlined />,
      },
      {
        label: "Support",
        key: "/support",
        icon: <MailOutlined />,
      },
      {
        type: 'divider',
      },
      {
        label: 'Polaris Bank',
        key: "#",
        icon: (
          <div style={{
            // marginRight: '5px'
          }}>
            <Image
            width={73}
            height={38}
            style={{
              paddingRight: '36px',
              // paddingTop: '5px'
              // marginRight: '95px'
            }}
            // preview={null}
            // src="/Images/Group 1688.png"
            src={require('../../Logos/polaris-logo/polarisSvg.svg').default} alt='Clients Logo'
          />
          </div>
        ),
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
          left: 0,
          top: 0,
          bottom: 0,
          color: "white",
          marginLeft: 15
        }}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="wyre-logo">
          <Space>
            {/* <Image width={80} src="/Images/Wyre white-08 1.png"></Image> */}
            <Button
              type="text"
              icon={
                collapsed ? (
                  <MenuOutlined style={{ color: "white" }} />
                ) : (
                  // <MenuFoldOutlined style={{ color: "white" }} />
                  <>
                    <Image width={80} src="/Images/Wyre white-08 1.png"></Image>
                    <Button
                      type="text"
                      icon={
                        collapsed ? (
                          <MenuOutlined style={{ color: "white" }} />
                        ) : (
                          <MenuOutlined style={{ marginLeft:220, color: "white" }} />
                        )
                      }
                      onClick={() => {
                        setCollapsed(!collapsed);
                      }}
                      style={{
                        // fontSize: "16px",
                        width: '0px',
                        // height: 64,
                      }}
                    />
                  </>
                )
              }
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              style={{
                // fontSize: "16px",
                width: 52,
                // height: 64,
              }}
            />
          </Space>
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
      </Sider>
    );
  }
  
  export default SideMenu;
  
  