import { BrowserRouter } from 'react-router-dom';
import './App.css';
import PageView from './components/pageContent/PageViews/PageView';
import SideMenu from './components/sideBar/SideMenu';
import Login from './Pages/AuthPages/Login';
import authHelper from './helpers/authHelper';
import { theme } from 'antd';
import { useState } from 'react';
import AuthRoute from './components/routes/AuthRoute';

function App() {
  const decodedUser = authHelper()
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const doColapse = () => {
  }
  // setCollapsed(collapsed)
  console.log('DECODE-USER', decodedUser);
  return (
    <div className="App">
      <BrowserRouter>
      {
        decodedUser && decodedUser.role_text === "CLIENT_ADMIN" ?
        <div>
          {/* <AppHeader /> */}
          <div className="SidemenuAndPagecontent">
            <SideMenu trigger={null} collapsible collapsed={collapsed} doColapse={doColapse} setCollapsed={setCollapsed}  />
            <PageView />
          </div>
          {/* <AppFooter /> */}
        </div> :
        <AuthRoute />
      }
      </BrowserRouter>
    </div>
  );
}

export default App;
