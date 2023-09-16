import { BrowserRouter } from 'react-router-dom';
import './App.css';
import AppFooter from './components/footer/AppFooter';
import AppHeader from './components/header/AppHeader';
import PageView from './components/pageContent/PageViews/PageView';
import SideMenu from './components/sideBar/SideMenu';
import Login from './Pages/AuthPages/Login';
import authHelper from './helpers/authHelper';

function App() {
  const decodedUser = authHelper()
  return (
    <div className="App">
      <BrowserRouter>
      {
        decodedUser && decodedUser.role_text === "CLIENT_ADMIN" ?
        <div>
          {/* <AppHeader /> */}
          <div className="SidemenuAndPagecontent">
            <SideMenu />
            <PageView />
          </div>
          {/* <AppFooter /> */}
        </div> :
        <Login />
      }
      </BrowserRouter>
    </div>
  );
}

export default App;
