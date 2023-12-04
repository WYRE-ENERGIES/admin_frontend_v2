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
import useToken from "antd/es/theme/useToken";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
  
function SideMenu({collapsed, doColapse, setCollapsed}) {
    const [selectedLocation, setSelectedLocation] = useState('/')
    const [handleCollapse, setHandleCollapse] = useState()
    const location = useLocation()
    // console.log("Looking for Collapsible in DoCollapse", doColapse);
    console.log("Looking for Collapsible>>>>>>>>>>", collapsed);
    console.log("Search for the Collapse = ", !collapsed);

    // const [collapsed, setCollapsed] = useState(false);
    const {
      token: { colorBgContainer },
    } = theme.useToken();
  
    useEffect( () => {
      const pathName = location.pathname
      setSelectedLocation(pathName)
    }, [location.pathname])
  
    const navigate = useNavigate()
    return (
      <div
        className="SideMenu"
        style={{
          // overflow: 'auto',
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className="wyre-logo">
          <Space>
            <Image width={80} src="/Images/Wyre white-08 1.png"></Image>
            <Button
              type="text"
              icon={
                collapsed ? (
                  <MenuUnfoldOutlined
                    style={{  color: "white" }}
                  />
                ) : (
                  <MenuFoldOutlined
                    style={{  color: "white" }}
                  />
                )
              }
              onClick={() => {
                setCollapsed(!collapsed)
                // setHandleCollapse(!collapsed);
                console.log("Am now clicked");
                console.log("Now Checking Collapsible", !collapsed);
              }}
              style={{
                // fontSize: "16px",
                width: 77,
                // height: 64,
              }}
            />
          </Space>
        </div>
        <Menu
          className="SideMenuVertical"
          mode="vertical"
          onClick={(Item) => {
            // Item.key
            navigate(Item.key);
          }}
          selectedLocation={[selectedLocation]}
          items={[
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
              label: "View Location",
              key: "/location",
              icon: <CompassOutlined />,
            },
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
              // label: <hr />,
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
              // label: <hr />,
            },
            {
              label: 'Polaris Bank',
              key: "#",
              icon: (
                <Image
                  width={40}
                  height={35}
                  style={{paddingRight: '10px', paddingTop: '15px'}}
                  // preview={null}
                  src="/Images/Group 1688.png"
                ></Image>
              ),
            },
          ]}
        ></Menu>
      </div>
    );
  }
  
  export default SideMenu;
  
  