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
  } from "@ant-design/icons";
  import { Image, Menu, Space } from "antd";
import Form from "antd/es/form/Form";
  import { useEffect, useState } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
  
  function SideMenu() {
    const [selectedLocation, setSelectedLocation] = useState('/')
    const location = useLocation()
  
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
      >
        {/* <header>header</header> */}
        <div className="wyre-logo">
          <Space>
            <Image
              width={80}
              // src="https://yt3.ggpht.com/yti/AHXOFjVZypuO-Nf2XxSIHpDVbNDOGH9beztDzVFDlg=s108-c-k-c0x00ffffff-no-rj"
              src="/Images/Wyre white-08 1.png"
            ></Image>
            <MenuOutlined style={{ marginLeft: "40px", color: 'white' }} />
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
            // {
            //   key: "#",
            //   icon: (
            //     <div className="wyre-logo" style={{ marginBottom: "100px" }}>
            //       <Space>
            //         <Image
            //           width={80}
            //           // src="https://yt3.ggpht.com/yti/AHXOFjVZypuO-Nf2XxSIHpDVbNDOGH9beztDzVFDlg=s108-c-k-c0x00ffffff-no-rj"
            //           src="/Images/Wyre white-08 1.png"
            //         ></Image>
            //         <MenuOutlined style={{ marginLeft: "50px" }} />
            //       </Space>
            //     </div>
            //   ),
            // },
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
              label: <hr />,
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
              label: <hr />,
            },
            {
              key: "#",
              icon: (
                <Image
                  width={80}
                  height={50}
                  // preview={null}
                  // src="https://yt3.ggpht.com/yti/AHXOFjVZypuO-Nf2XxSIHpDVbNDOGH9beztDzVFDlg=s108-c-k-c0x00ffffff-no-rj"
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
  
  