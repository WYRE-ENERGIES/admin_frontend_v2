// function SideMenu() {
//     return (
//       <div className="SideMenu">
//         <sidebar>Side Menu</sidebar>
//       </div>
//     );
//   }
  
//   export default SideMenu;


import {
  UserOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  AppstoreFilled,
  AppstoreAddOutlined,
  AppstoreTwoTone,
  AppleOutlined,
  HomeOutlined,
  MenuOutlined,
  FormOutlined,
  HeatMapOutlined,
  CompassOutlined,
  SettingFilled,
  SettingOutlined,
  LogoutOutlined,
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
  
function SideMenu({collapsed, setCollapsed}) {
    const [selectedLocation, setSelectedLocation] = useState('/')
    const location = useLocation()
    const {
      token: { colorBgContainer },
    } = theme.useToken();
    
    const items = [
      {
        label: "Admin Overview",
        key: "/",
        icon: <HomeOutlined />,
      },
      {
        label: "Client Users",
        key: "/client-user",
        icon: <UserOutlined />,
      },
      {
        label: "Regions Activities",
        key: "/regions-activities",
        icon: <CompassOutlined />,
      },
      {
        label: "View Location",
        key: "/location",
        icon: <CompassOutlined />,
      },
      // {
      //   label: "Desiel overview",
      //   key: "/diesel-overview",
      //   icon: <CompassOutlined />,
      // },
      {
        label: "Set Target",
        key: "/set-target",
        icon: <SettingOutlined />,
      },
      {
        label: "Send Energy Data",
        key: "/energy-Data",
        icon: <SendOutlined />,
      },
      {
        label: "Log out",
        key: "/logout",
        icon: <LogoutOutlined />,
      },
      {
        label: "Supports",
        key: "/support",
        icon: <MailOutlined />,
      },
      {
        label: "Settings",
        key: "/setting",
        icon: <SettingFilled />,
      },
      {
        label: 'Polaris Bank',
        key: "#",
        icon: (
          <Image
            width={73}
            height={38}
            style={{paddingRight: '35px', paddingTop: '5px'}}
            // preview={null}
            // src="/Images/Group 1688.png"
            src={require('../../Logos/polaris-logo/polarisSvg.svg').default} alt='Logo'
          />
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
                  <MenuUnfoldOutlined style={{ color: "white" }} />
                ) : (
                  // <MenuFoldOutlined style={{ color: "white" }} />
                  <>
                    <Image width={80} src="/Images/Wyre white-08 1.png"></Image>
                    <Button
                      type="text"
                      icon={
                        collapsed ? (
                          <MenuUnfoldOutlined style={{ color: "white" }} />
                        ) : (
                          <MenuFoldOutlined style={{ color: "white" }} />
                        )
                      }
                      onClick={() => {
                        setCollapsed(!collapsed);
                      }}
                      style={{
                        // fontSize: "16px",
                        width: 195,
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
                width: 60,
                // height: 64,
              }}
            />
          </Space>
        </div>
        <Menu
          className="SideMenuVertical"
          // theme="dark"
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
  
  